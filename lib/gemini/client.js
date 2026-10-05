import { env } from "../config/env.js";

// Initialize Gemini client (using direct fetch, no SDK).
// The API key goes in a header, not the URL, so it can't leak through logged URLs.
export const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export async function callGemini(prompt, temperature = 0.8, maxTokens = 8192) {
  if (!env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": env.GEMINI_API_KEY,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Gemini API error (HTTP ${response.status}): ${err.error?.message || "unknown error"}`);
  }

  const data = await response.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!raw) throw new Error("Empty response from Gemini");

  // Strip markdown fences Gemini occasionally adds
  return raw.replace(/^```json\n?|```$/gm, "").trim();
}
