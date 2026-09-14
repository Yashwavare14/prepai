import { insertQuestionsFromPdf, logPdfSource, markPdfProcessed } from "@/lib/db/queries";

export async function POST(req) {
  try {
    const body = await req.json();
    const { questions, exam, topic, filename, status = "approved" } = body;

    const list = Array.isArray(questions) ? questions : [questions];
    const validList = list.filter((q) => q && q.question && q.options);

    if (validList.length === 0) {
      return Response.json(
        { error: "No valid questions provided to save" },
        { status: 400 }
      );
    }

    let sourceId = null;
    if (filename) {
      sourceId = await logPdfSource({ filename, exam, topic });
    }

    const inserted = await insertQuestionsFromPdf(validList, {
      topic,
      exam,
      filename: filename || "pdf-extract",
      status,
    });

    if (sourceId) {
      await markPdfProcessed(sourceId);
    }

    return Response.json({
      success: true,
      count: inserted.length,
      inserted,
    });
  } catch (err) {
    console.error("Save extracted questions error:", err);
    return Response.json(
      { error: err.message || "Failed to save questions" },
      { status: 500 }
    );
  }
}
