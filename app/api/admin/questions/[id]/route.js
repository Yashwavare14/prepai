import { deleteQuestion } from "@/lib/db/queries";
import { z } from "zod";

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const parsed = paramsSchema.safeParse({ id });
    if (!parsed.success) {
      return Response.json({ error: "Invalid question ID" }, { status: 400 });
    }

    await deleteQuestion(parsed.data.id);
    return Response.json({ success: true });
  } catch (err) {
    console.error("Delete question error:", err);
    return Response.json(
      { error: err.message || "Failed to delete question" },
      { status: 500 }
    );
  }
}
