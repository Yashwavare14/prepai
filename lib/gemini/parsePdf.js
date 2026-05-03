import { callGemini } from "./client.js";
import { PDF_PARSE_PROMPT } from "./prompts.js";
import { pdfParsedQuestionsSchema } from "../validation/schemas.js";
import { withRetry } from "../utils/retry.js";

export async function parseQuestionsFromText(text) {
  const prompt = PDF_PARSE_PROMPT + text;

  const response = await withRetry(() =>
    callGemini(prompt, 0.1, 8192)
  );

  const clean = response.replace(/^```json\n?|```$/gm, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(clean);
  } catch {
    throw new Error("Gemini returned invalid JSON during PDF parse");
  }

  // Validate each extracted question with Zod
  const result = pdfParsedQuestionsSchema.safeParse(parsed);
  if (!result.success) {
    console.error("PDF parse validation failed:", result.error.flatten());
    throw new Error("Extracted questions did not match expected structure");
  }

  return result.data;
}
