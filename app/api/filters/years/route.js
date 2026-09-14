import { fetchYears } from "@/lib/db/queries";

export async function GET() {
  try {
    const years = await fetchYears();
    return Response.json(years);
  } catch (err) {
    console.error("Fetch years error:", err);
    return Response.json(
      { error: "Failed to fetch years" },
      { status: 500 }
    );
  }
}
