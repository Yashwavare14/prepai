import { env } from "../config/env.js";

// Initialize Gemini client (using direct fetch, no SDK)
export const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;

export async function callGemini(prompt, temperature = 0.8, maxTokens = 8192) {
  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
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
