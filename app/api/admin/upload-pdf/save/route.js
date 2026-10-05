import { insertQuestionsFromPdf, logPdfSource, markPdfProcessed } from "@/lib/db/queries";
import { requireSuperAdmin } from "@/lib/security/auth";
import { savePdfQuestionsSchema } from "@/lib/validation/schemas";

export async function POST(req) {
  const denied = await requireSuperAdmin();
  if (denied) return denied;

  try {
    const body = await req.json();
    const result = savePdfQuestionsSchema.safeParse(body);
    if (!result.success) {
      return Response.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { questions, exam, topic, paperSection, section, filename, status } = result.data;

    let sourceId = null;
    if (filename) {
      sourceId = await logPdfSource({ filename, exam, topic });
    }

    const inserted = await insertQuestionsFromPdf(questions, {
      topic,
      paperSection: paperSection || section || null,
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
