import { extractText } from "unpdf";
import { parseQuestionsFromText } from "@/lib/gemini/parsePdf";
import { insertQuestionsFromPdf, logPdfSource, markPdfProcessed } from "@/lib/db/queries";

const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file  = formData.get("pdf");
    const exam  = formData.get("exam");
    const topic = formData.get("topic");

    // 2. Validate file
    if (!file || file.type !== "application/pdf") {
      return Response.json({ error: "A valid PDF file is required" }, { status: 400 });
    }
    if (file.size > MAX_PDF_SIZE) {
      return Response.json({ error: "File too large. Max size is 10MB." }, { status: 400 });
    }

    // 3. Validate form fields
    if (!exam || !topic) {
      return Response.json({ error: "exam and topic are required" }, { status: 400 });
    }

    // 4. Extract text from PDF
    const buffer = Buffer.from(await file.arrayBuffer());
    const { text:pages } = await extractText(new Uint8Array(buffer));
    const text = Array.isArray(pages) ? pages.join("\n") : pages;
    console.log(text)

    if (!text || text.trim().length === 0) {
      return Response.json({ error: "Could not extract text from PDF. Is it a scanned image?" }, { status: 400 });
    }

    // 5. Log the upload
    const sourceId = await logPdfSource({ filename: file.name, exam, topic });

    // 6. Parse questions via Gemini (Zod validation inside parseQuestionsFromText)
    const questions = await parseQuestionsFromText(text);

    // 7. Save to DB as pending_review
    await insertQuestionsFromPdf(questions, { topic, exam, filename: file.name });

    // 8. Mark PDF as processed
    await markPdfProcessed(sourceId);

    return Response.json({ success: true, questionsExtracted: questions.length });
  } catch (err) {
    console.error("PDF upload error:", err);
    return Response.json(
      { error: err.message || "Failed to process PDF" },
      { status: 500 }
    );
  }
}
