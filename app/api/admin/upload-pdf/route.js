import { extractBlocks } from "@/lib/external/pdfParser";
import { transformQuestions } from "@/lib/external/transformQuestions";
import { pdfParsedQuestionSchema } from "@/lib/validation/schemas";
import { insertQuestionsFromPdf, logPdfSource, markPdfProcessed } from "@/lib/db/queries";

const MAX_PDF_SIZE = 25 * 1024 * 1024; // 25MB

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("pdf") || formData.get("file") || formData.get("pdfFile");
    const exam = formData.get("exam");
    const topic = formData.get("topic");
    const section = formData.get("section") || undefined;
    const provider = formData.get("provider") || undefined;
    const model = formData.get("model") || undefined;

    // 1. Validate file
    if (!file || typeof file === "string") {
      return Response.json({ error: "A valid PDF file is required" }, { status: 400 });
    }
    if (file.size > MAX_PDF_SIZE) {
      return Response.json({ error: "File too large. Max size is 25MB." }, { status: 400 });
    }

    // 2. Validate form fields
    if (!exam || !topic) {
      return Response.json({ error: "exam and topic are required" }, { status: 400 });
    }

    // 3. Read PDF buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // 4. Extract question blocks via external service
    const rawData = await extractBlocks(buffer, file.name, {
      section: section && section !== "all" ? section : undefined,
      provider,
      model,
    });

    // 5. Transform external format to PrepAI format
    const transformed = transformQuestions(rawData);

    if (!transformed || transformed.length === 0) {
      return Response.json(
        { error: "No questions found or extracted from the selected section of this PDF." },
        { status: 422 }
      );
    }

    // 6. Validate each question against schema
    const validQuestions = [];
    for (const q of transformed) {
      const parsed = pdfParsedQuestionSchema.safeParse(q);
      if (parsed.success) {
        validQuestions.push(parsed.data);
      } else {
        console.warn("Skipping invalid question:", parsed.error.flatten(), q);
      }
    }

    if (validQuestions.length === 0) {
      return Response.json(
        { error: "Extracted questions failed schema validation." },
        { status: 422 }
      );
    }

    const autoSave = formData.get("autoSave") === "true";

    // Format questions for preview
    const formattedQuestions = validQuestions.map((q, idx) => ({
      tempId: `extract-${Date.now()}-${idx}`,
      question: q.question,
      options: q.options,
      correctAnswer: q.correct_answer || q.correctAnswer || "A",
      explanation: q.explanation ?? null,
      topic,
      exam,
      difficulty: "medium",
      status: "pending_approval",
      source: file.name,
    }));

    if (autoSave) {
      const sourceId = await logPdfSource({ filename: file.name, exam, topic });
      const inserted = await insertQuestionsFromPdf(formattedQuestions, {
        topic,
        exam,
        filename: file.name,
        status: "pending_review",
      });
      await markPdfProcessed(sourceId);

      return Response.json({
        success: true,
        saved: true,
        questionsExtracted: inserted.length,
        totalParsed: transformed.length,
        questions: inserted,
      });
    }

    return Response.json({
      success: true,
      saved: false,
      questionsExtracted: formattedQuestions.length,
      totalParsed: transformed.length,
      filename: file.name,
      exam,
      topic,
      questions: formattedQuestions,
    });
  } catch (err) {
    console.error("PDF upload error:", err);
    return Response.json(
      { error: err.message || "Failed to process PDF" },
      { status: 500 }
    );
  }
}
