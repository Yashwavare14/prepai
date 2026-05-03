import { auth } from "@clerk/nextjs/server";

export function requireAuth() {
  const { userId } = auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null; // null means auth passed
}
