import {
  pgTable,
  serial,
  text,
  jsonb,
  char,
  varchar,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { customType } from "drizzle-orm/pg-core";

// pgvector custom type — Drizzle doesn't have a built-in vector type yet
const vector = customType({
  dataType(config) {
    return `vector(${config.dimensions})`;
  },
});

export const questions = pgTable(
  "questions",
  {
    id:            serial("id").primaryKey(),
    question:      text("question").notNull(),
    options:       jsonb("options").notNull(),
    // { "A": "...", "B": "...", "C": "...", "D": "..." }
    correctAnswer: char("correct_answer", { length: 1 }).notNull(),
    // "A" | "B" | "C" | "D"
    explanation:   text("explanation"),
    topic:         varchar("topic", { length: 100 }).notNull(),
    // "Quants" | "GK" | "Reasoning" | "English"
    exam:          varchar("exam", { length: 100 }),
    // "SSC CGL" | "IBPS PO" | "RRB NTPC" | "UPSC" etc.
    difficulty:    varchar("difficulty", { length: 20 }).notNull(),
    // "easy" | "medium" | "hard"
    status:        varchar("status", { length: 20 }).default("approved"),
    // "approved" | "pending_review"
    source:        varchar("source", { length: 255 }),
    // "manual" | pdf filename
    embedding:     vector("embedding", { dimensions: 768 }),
    // pgvector: reserved for future semantic search
    createdAt:     timestamp("created_at").defaultNow(),
  },
  (table) => ({
    topicIdx:      index("idx_questions_topic").on(table.topic),
    examIdx:       index("idx_questions_exam").on(table.exam),
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
