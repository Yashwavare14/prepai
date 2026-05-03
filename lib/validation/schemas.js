import { z } from "zod";

const VALID_DIFFICULTIES = ["easy", "medium", "hard"];
const VALID_ANSWERS      = ["A", "B", "C", "D"];

// --- Request body for generating a mock test ---
export const generateTestSchema = z.object({
  exam:       z.string().min(1, "exam is required").max(100),
  topic:      z.string().min(1, "topic is required").max(100),
  difficulty: z.enum(VALID_DIFFICULTIES, {
    errorMap: () => ({ message: "difficulty must be easy, medium, or hard" }),
  }),
  count: z
    .number({ invalid_type_error: "count must be a number" })
    .int()
    .min(5, "minimum 5 questions")
    .max(50, "maximum 50 questions")
    .default(20),
});

// --- Options object shape ---
const optionsSchema = z.object({
  A: z.string().min(1),
  B: z.string().min(1),
  C: z.string().min(1),
  D: z.string().min(1),
});

// --- Request body for manually adding a question ---
export const insertQuestionSchema = z.object({
  question:      z.string().min(5, "question is too short").max(1000),
  options:       optionsSchema,
  correctAnswer: z.enum(VALID_ANSWERS),
  explanation:   z.string().max(1000).optional(),
  topic:         z.string().min(1).max(100),
  exam:          z.string().min(1).max(100),
  difficulty:    z.enum(VALID_DIFFICULTIES),
});

// --- Shape of a single question returned by Gemini ---
export const geminiQuestionSchema = z.object({
  id:            z.number(),
  question:      z.string().min(1),
  options:       optionsSchema,
  correct_answer: z.enum(VALID_ANSWERS),
  explanation:   z.string(),
});

// --- Full mock test response from Gemini ---
export const geminiMockTestSchema = z.object({
  title:              z.string(),
  exam:               z.string(),
  total_questions:    z.number(),
  time_limit_minutes: z.number(),
  questions:          z.array(geminiQuestionSchema).min(1),
});

// --- Single question parsed from PDF by Gemini ---
export const pdfParsedQuestionSchema = z.object({
  question:       z.string().min(1),
  options:        optionsSchema,
  correct_answer: z.enum(VALID_ANSWERS),
  explanation:    z.string().nullable().optional(),
});

// --- Array of questions parsed from PDF ---
export const pdfParsedQuestionsSchema = z.array(pdfParsedQuestionSchema).min(1);
