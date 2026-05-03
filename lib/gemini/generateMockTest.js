import { callGemini } from "./client.js";
import { formatQuestionsForPrompt } from "./formatQuestions.js";
import { MOCK_TEST_SYSTEM_PROMPT, MOCK_TEST_OUTPUT_SCHEMA } from "./prompts.js";
import { geminiMockTestSchema } from "../validation/schemas.js";
import { withRetry } from "../utils/retry.js";

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
