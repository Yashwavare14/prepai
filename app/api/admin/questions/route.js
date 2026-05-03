import { fetchAllQuestions, insertQuestion } from "@/lib/db/queries";
import { insertQuestionSchema } from "@/lib/validation/schemas";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const exam = searchParams.get("exam") || undefined;
    const topic = searchParams.get("topic") || undefined;

    const questions = await fetchAllQuestions({ exam, topic });
    return Response.json(questions);
  } catch (err) {
    console.error("Fetch questions error:", err);
    return Response.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const result = insertQuestionSchema.safeParse(body);
    if (!result.success) {
      return Response.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const id = await insertQuestion(result.data);
    return Response.json({ success: true, id });
  } catch (err) {
    console.error("Insert question error:", err);
    return Response.json(
      { error: err.message || "Failed to insert question" },
      { status: 500 }
    );
  }
}
