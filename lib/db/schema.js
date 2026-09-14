import {
  pgTable,
  serial,
  text,
  jsonb,
  char,
  varchar,
  integer,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { customType } from "drizzle-orm/pg-core";

import { generateQuestionUid } from "../utils/uid.js";

// pgvector custom type — Drizzle doesn't have a built-in vector type yet
const vector = customType({
  dataType(config) {
    return `vector(${config.dimensions})`;
  },
});

export const questions = pgTable(
  "questions",
  {
    id:               varchar("id", { length: 20 }).primaryKey().$defaultFn(() => generateQuestionUid(6)),
    question:         text("question").notNull(),
    options:          jsonb("options").notNull(),
    // { "A": "...", "B": "...", "C": "...", "D": "..." }
    correctAnswer:    char("correct_answer", { length: 1 }).notNull(),
    // "A" | "B" | "C" | "D"
    explanation:      text("explanation"),
    topic:            varchar("topic", { length: 100 }).notNull(),
    // "Quants" | "GK" | "Reasoning" | "English"
    exam:             varchar("exam", { length: 100 }),
    // "SSC CGL" | "IBPS PO" | "RRB NTPC" | "UPSC" etc.
    year:             varchar("year", { length: 20 }),
    // Exam year: "2021", "2022", "2023", etc.
    shift:            varchar("shift", { length: 50 }),
    paperSection:     varchar("paper_section", { length: 100 }),
    hasImage:         boolean("has_image").default(false),
    imageUrl:         text("image_url"),
    imageDescription: text("image_description"),
    questionNumber:   integer("question_number"),
    difficulty:       varchar("difficulty", { length: 20 }).notNull(),
    // "easy" | "medium" | "hard"
    status:           varchar("status", { length: 20 }).default("approved"),
    // "approved" | "pending_review"
    source:           varchar("source", { length: 255 }),
    // "manual" | pdf filename
    metadata:         jsonb("metadata"),
    // Rich extra details: paper_title, shift, tier, exam_date, etc.
    embedding:        vector("embedding", { dimensions: 768 }),
    // pgvector: reserved for future semantic search
    createdAt:        timestamp("created_at").defaultNow(),
  },
  (table) => ({
    topicIdx:      index("idx_questions_topic").on(table.topic),
    examIdx:       index("idx_questions_exam").on(table.exam),
    yearIdx:       index("idx_questions_year").on(table.year),
    difficultyIdx: index("idx_questions_difficulty").on(table.difficulty),
    statusIdx:     index("idx_questions_status").on(table.status),
    // Note: the HNSW index for embedding cannot be defined via Drizzle yet.
    // Run it manually in Neon SQL editor after migration (see Step 8).
  })
);

export const pdfSources = pgTable("pdf_sources", {
  id:         serial("id").primaryKey(),
  filename:   varchar("filename", { length: 255 }).notNull(),
  exam:       varchar("exam", { length: 100 }),
  topic:      varchar("topic", { length: 100 }),
  status:     varchar("status", { length: 20 }).default("processed"),
  // "processing" | "processed" | "failed"
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const students = pgTable(
  "students",
  {
    // --- Auth & Identity (Clerk) ---
    id:                   varchar("id", { length: 64 }).primaryKey(), // Clerk userId e.g. user_2...
    email:                varchar("email", { length: 255 }).notNull().unique(),
    name:                 varchar("name", { length: 255 }),
    avatarUrl:            text("avatar_url"),
    phone:                varchar("phone", { length: 20 }),
    role:                 varchar("role", { length: 20 }).default("student"), // 'student' | 'admin'

    // --- Academic Background ---
    // 10th Standard
    tenthPercentage:      varchar("tenth_percentage", { length: 10 }), // e.g. "88.5" or "88.5%"
    tenthSchool:          varchar("tenth_school", { length: 255 }),
    tenthBoard:           varchar("tenth_board", { length: 50 }),
    tenthPassingYear:     varchar("tenth_passing_year", { length: 4 }),

    // 12th Standard
    twelfthPercentage:    varchar("twelfth_percentage", { length: 10 }),
    twelfthSchool:        varchar("twelfth_school", { length: 255 }),
    twelfthBoard:         varchar("twelfth_board", { length: 50 }),
    twelfthStream:        varchar("twelfth_stream", { length: 50 }), // PCM, PCB, Commerce, Arts
    twelfthPassingYear:   varchar("twelfth_passing_year", { length: 4 }),

    // Graduation / Higher Education
    graduationDegree:     varchar("graduation_degree", { length: 100 }), // B.Tech, B.Sc, B.Com, etc.
    graduationCollege:    varchar("graduation_college", { length: 255 }),
    graduationScore:      varchar("graduation_score", { length: 20 }), // CGPA or percentage
    graduationStatus:     varchar("graduation_status", { length: 20 }), // 'completed', 'pursuing', 'not_applicable'
    graduationPassingYear: varchar("graduation_passing_year", { length: 4 }),

    // --- Competitive Exam Targets & Preferences ---
    targetExams:          jsonb("target_exams").default([]), // ["SSC CGL", "RRB NTPC"]
    targetYear:           varchar("target_year", { length: 10 }),
    preferredLanguage:    varchar("preferred_language", { length: 10 }).default("en"),
    dailyGoalQuestions:   integer("daily_goal_questions").default(20),
    onboardingCompleted:  boolean("onboarding_completed").default(false),

    // --- Progress & Gamification ---
    currentStreakDays:    integer("current_streak_days").default(0),
    longestStreakDays:    integer("longest_streak_days").default(0),
    lastActiveAt:         timestamp("last_active_at"),
    xpPoints:             integer("xp_points").default(0),
    totalAttempted:       integer("total_attempted").default(0),
    totalCorrect:         integer("total_correct").default(0),

    // --- Account / Plan ---
    plan:                 varchar("plan", { length: 20 }).default("free"), // 'free', 'pro', 'premium'

    // --- Metadata & Timestamps ---
    extraAcademicData:    jsonb("extra_academic_data"), // certifications, awards, diplomas, etc.
    preferences:          jsonb("preferences").default({}),
    createdAt:            timestamp("created_at").defaultNow(),
    updatedAt:            timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    emailIdx: index("idx_students_email").on(table.email),
    roleIdx:  index("idx_students_role").on(table.role),
  })
);

