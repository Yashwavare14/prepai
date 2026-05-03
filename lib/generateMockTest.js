import { env } from "./env.js";
import { formatQuestionsForPrompt } from "./formatQuestions.js";
import { MOCK_TEST_SYSTEM_PROMPT, MOCK_TEST_OUTPUT_SCHEMA } from "./prompts.js";
import { geminiMockTestSchema } from "./schemas.js";
import { withRetry } from "./retry.js";

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;

async function callGemini(prompt) {
  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 8192,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Gemini API error: ${err.error?.message}`);
  }

  const data = await response.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!raw) throw new Error("Empty response from Gemini");

  // Strip markdown fences Gemini occasionally adds
  return raw.replace(/^```json\n?|```$/gm, "").trim();
}

export async function generateMockTest({ referenceQuestions, topic, exam, difficulty, count = 20 }) {
  const formattedExamples = formatQuestionsForPrompt(referenceQuestions);

  const prompt = `
${MOCK_TEST_SYSTEM_PROMPT}

EXAM: ${exam}
TOPIC: ${topic}
DIFFICULTY: ${difficulty}

Here are ${referenceQuestions.length} reference questions to understand the style and pattern:

${formattedExamples}

Now generate ${count} FRESH and ORIGINAL questions following the exact same pattern.

${MOCK_TEST_OUTPUT_SCHEMA}
  `;

  const raw = await withRetry(() => callGemini(prompt));

  // Parse JSON
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Gemini returned invalid JSON: " + raw);
  }

  // Validate with Zod — ensures Gemini returned the correct shape
  const result = geminiMockTestSchema.safeParse(parsed);
  if (!result.success) {
    console.error("Gemini response failed schema validation:", result.error.flatten());
    throw new Error("Gemini response did not match expected structure");
  }

  return result.data;
}
