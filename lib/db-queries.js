import db from "./db.js";
import { questions, pdfSources } from "./schema.js";
import { eq, and, sql } from "drizzle-orm";

// --- Fetch reference questions for Gemini few-shot ---
export async function fetchQuestions({ topic, exam, difficulty, count = 5 }) {
  const rows = await db
    .select()
    .from(questions)
    .where(
      and(
        eq(questions.topic, topic),
        eq(questions.exam, exam),
        eq(questions.difficulty, difficulty),
        eq(questions.status, "approved")
      )
    )
    .orderBy(sql`RANDOM()`)
    .limit(count);

  if (rows.length === 0) {
    throw new Error(`No reference questions found for ${exam} → ${topic} (${difficulty})`);
  }

  if (rows.length < 3) {
    console.warn(`Only ${rows.length} reference questions — generation quality may vary`);
  }

  return rows;
}

// --- Fetch distinct exams and topics for UI dropdowns ---
export async function fetchExams() {
  const rows = await db
    .selectDistinct({ exam: questions.exam })
    .from(questions)
    .orderBy(questions.exam);
  return rows.map((r) => r.exam);
}

export async function fetchTopics(exam) {
  const rows = await db
    .selectDistinct({ topic: questions.topic })
    .from(questions)
    .where(eq(questions.exam, exam))
    .orderBy(questions.topic);
  return rows.map((r) => r.topic);
}

// --- Admin: fetch all questions with optional filters ---
export async function fetchAllQuestions({ exam, topic } = {}) {
  const conditions = [];
  if (exam) conditions.push(eq(questions.exam, exam));
  if (topic) conditions.push(eq(questions.topic, topic));

  return await db
    .select()
    .from(questions)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(questions.createdAt);
}

// --- Admin: insert question manually ---
export async function insertQuestion({ question, options, correctAnswer, explanation, topic, exam, difficulty }) {
  const [row] = await db
    .insert(questions)
    .values({ question, options, correctAnswer, explanation, topic, exam, difficulty, status: "approved", source: "manual" })
    .returning({ id: questions.id });
  return row.id;
}

// --- Admin: bulk insert questions parsed from PDF ---
export async function insertQuestionsFromPdf(parsedQuestions, { topic, exam, filename }) {
  const values = parsedQuestions.map((q) => ({
    question:      q.question,
    options:       q.options,
    correctAnswer: q.correct_answer,
    explanation:   q.explanation ?? null,
    topic,
    exam,
    difficulty:    "medium",
    status:        "pending_review",
    source:        filename,
  }));

  await db.insert(questions).values(values);
}

// --- Admin: approve a pending question ---
export async function approveQuestion(id) {
  await db.update(questions).set({ status: "approved" }).where(eq(questions.id, id));
}

// --- Admin: delete a question ---
export async function deleteQuestion(id) {
  await db.delete(questions).where(eq(questions.id, id));
}

// --- PDF source tracking ---
export async function logPdfSource({ filename, exam, topic }) {
  const [row] = await db
    .insert(pdfSources)
    .values({ filename, exam, topic, status: "processing" })
    .returning({ id: pdfSources.id });
  return row.id;
}

export async function markPdfProcessed(id) {
  await db.update(pdfSources).set({ status: "processed" }).where(eq(pdfSources.id, id));
}
