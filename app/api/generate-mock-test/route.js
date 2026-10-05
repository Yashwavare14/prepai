import { auth } from "@clerk/nextjs/server";
import { fetchQuestions } from "@/lib/db/queries";
import { generateMockTest } from "@/lib/gemini/generateMockTest";
import { generateTestSchema } from "@/lib/validation/schemas";
import { rateLimit } from "@/lib/security/rateLimit";

export async function POST(req) {
  // 1. Every request costs a Gemini call, so require a signed-in user
  //    (middleware also enforces this).
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized: Please sign in" }, { status: 401 });
  }

  // Existing best-effort limiter (unchanged)
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  if (rateLimit(ip, 10, 60_000)) {
    return Response.json(
      { error: "Too many requests. Try again in a minute." },
      { status: 429 }
    );
  }

  try {
    // 2. Parse and validate request body with Zod
    const body = await req.json();
    const result = generateTestSchema.safeParse(body);
    if (!result.success) {
      return Response.json(
        { error: "Invalid request", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { exam, topic, difficulty, count } = result.data;

    // 3. Fetch reference questions from DB
    const referenceQuestions = await fetchQuestions({ topic, exam, difficulty, count: 5 });

    // 4. Generate mock test via Gemini
    const mockTest = await generateMockTest({ referenceQuestions, topic, exam, difficulty, count });

    return Response.json(mockTest);
  } catch (err) {
    // Log the details server-side; don't send database or Gemini internals to the browser.
    console.error("Generate mock test error:", err);
    const isMissingReferences = err?.message?.startsWith("No reference questions found");
    return Response.json(
      {
        error: isMissingReferences
          ? "No practice questions are available for that exam, topic and difficulty yet."
          : "Failed to generate mock test. Please try again.",
      },
      { status: isMissingReferences ? 404 : 500 }
    );
  }
}
