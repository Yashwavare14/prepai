import { fetchPaperSections } from "@/lib/db/queries";
import { EXAM_SECTIONS } from "@/lib/constants/taxonomy";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const exam = searchParams.get("exam") || undefined;

    const dbSections = await fetchPaperSections(exam);
    // Combine canonical sections with any distinct sections from DB
    const combined = Array.from(new Set([...EXAM_SECTIONS, ...dbSections])).filter(Boolean);

    return Response.json(combined);
  } catch (err) {
    console.error("Fetch sections error:", err);
    return Response.json(
      { error: "Failed to fetch paper sections" },
      { status: 500 }
    );
  }
}
