import { env } from "./env.js";
import { PDF_PARSE_PROMPT } from "./prompts.js";
import { pdfParsedQuestionsSchema } from "./schemas.js";
import { withRetry } from "./retry.js";

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;

export async function parseQuestionsFromText(text) {
  const prompt = PDF_PARSE_PROMPT + text;

  const response = await withRetry(() =>
    fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1, // low = strict, accurate extraction
          maxOutputTokens: 8192,
        },
      }),
    })
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Gemini PDF parse error: ${err.error?.message}`);
  }

  const data = await response.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
  const clean = raw.replace(/^```json\n?|```$/gm, "").trim();

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
