import { auth } from "@clerk/nextjs/server";

export async function requireAuth() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null; // null means auth passed
}

export async function getAuthUser() {
  const { userId, orgId, orgRole } = await auth();
  return { userId, orgId, orgRole };
}

