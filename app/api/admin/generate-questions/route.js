import { fetchQuestions, insertGeneratedQuestions } from "@/lib/db/queries";
import { generateMockTest } from "@/lib/gemini/generateMockTest";
import { generateTestSchema } from "@/lib/validation/schemas";

export async function POST(req) {
  try {
    const body = await req.json();
    const result = generateTestSchema.safeParse(body);
    if (!result.success) {
      return Response.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { exam, topic, difficulty, count } = result.data;

    const referenceQuestions = await fetchQuestions({ exam, topic, difficulty, count: 5 });
    console.log("Reference questions for generation:", referenceQuestions);
    if (referenceQuestions.length < 3) {
      return Response.json(
        { error: "Need at least 3 approved reference questions for this exam/topic before generating new ones." },
        { status: 400 }
      );
    }

    const generatedTest = await generateMockTest({ referenceQuestions, exam, topic, difficulty, count });

    await insertGeneratedQuestions(generatedTest.questions, { exam, topic, source: "generated" });

    return Response.json({ success: true, generatedCount: generatedTest.questions.length });
  } catch (err) {
    console.error("Generate questions error:", err);
    return Response.json(
      { error: err.message || "Failed to generate questions" },
      { status: 500 }
    );
  }
}
