import { fetchQuestions } from "@/lib/db/queries";
import { generateMockTest } from "@/lib/gemini/generateMockTest";
import { generateTestSchema } from "@/lib/validation/schemas";
import { rateLimit } from "@/lib/security/rateLimit";

export async function POST(req) {
  try {
    // 1. Rate limit
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (rateLimit(ip, 10, 60_000)) {
      return Response.json(
        { error: "Too many requests. Try again in a minute." },
        { status: 429 }
      );
    }

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
    console.error("Generate mock test error:", err);
    return Response.json(
      { error: err.message || "Failed to generate mock test" },
      { status: 500 }
    );
  }
}
