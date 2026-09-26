import { fetchTopics } from "@/lib/db/queries";
import { getTopicsForSection } from "@/lib/constants/taxonomy";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const exam = searchParams.get("exam") || undefined;
    const section = searchParams.get("section") || searchParams.get("paperSection") || undefined;

    // Fetch topics from database for this exam and/or section
    let dbTopics = [];
    try {
      dbTopics = await fetchTopics(exam, section);
    } catch {
      dbTopics = [];
    }

    // Get canonical topics for this section (or all topics if no section specified)
    const canonicalTopics = getTopicsForSection(section);

    // Merge uniquely, prioritizing canonical topics order
    const combined = Array.from(new Set([...canonicalTopics, ...dbTopics])).filter(Boolean);

    return Response.json(combined);
  } catch (err) {
    console.error("Fetch topics error:", err);
    return Response.json(
      { error: "Failed to fetch topics" },
      { status: 500 }
    );
  }
}
