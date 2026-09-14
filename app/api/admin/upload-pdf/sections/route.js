import { extractSections } from "@/lib/external/pdfParser";

const MAX_PDF_SIZE = 25 * 1024 * 1024; // 25MB

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("pdf") || formData.get("file") || formData.get("pdfFile");
    const provider = formData.get("provider") || undefined;
    const model = formData.get("model") || undefined;

    if (!file || typeof file === "string") {
      return Response.json(
        { error: "A valid PDF file is required" },
        { status: 400 }
      );
    }

    if (file.size > MAX_PDF_SIZE) {
      return Response.json(
        { error: "File too large. Max size is 25MB." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const sections = await extractSections(buffer, file.name, { provider, model });

    return Response.json({
      success: true,
      sections,
    });
  } catch (err) {
    console.error("Section extraction error:", err);
    return Response.json(
      { error: err.message || "Failed to extract sections from PDF" },
      { status: 500 }
    );
  }
}
