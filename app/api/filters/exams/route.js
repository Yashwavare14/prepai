import { fetchExams } from "@/lib/db/queries";

export async function GET(req) {
  try {
    const exams = await fetchExams();
    return Response.json(exams);
  } catch (err) {
    console.error("Fetch exams error:", err);
    return Response.json(
      { error: "Failed to fetch exams" },
      { status: 500 }
    );
  }
}
