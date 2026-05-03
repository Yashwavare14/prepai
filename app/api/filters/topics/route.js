import { fetchTopics } from "@/lib/db/queries";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const exam = searchParams.get("exam");

    if (!exam) {
      return Response.json(
        { error: "exam query parameter is required" },
        { status: 400 }
      );
    }

    const topics = await fetchTopics(exam);
    return Response.json(topics);
  } catch (err) {
    console.error("Fetch topics error:", err);
    return Response.json(
      { error: "Failed to fetch topics" },
      { status: 500 }
    );
  }
}
