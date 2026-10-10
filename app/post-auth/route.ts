import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/security/auth";
import { getStudentById } from "@/lib/db/queries";
import { safeRedirectPath } from "@/lib/auth/clerk-errors";

/**
 * Where every successful sign-in or sign-up lands. Picks the right home for the user:
 *   super admin             -> admin console (Question Studio until /admin/dashboard ships)
 *   institute admin         -> institute workspace
 *   student, profile not done -> onboarding
 *   student                 -> ?redirect_url (same-origin only) or the student dashboard
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const to = (path: string) => NextResponse.redirect(new URL(path, url));

  const user = await getAuthUser();
  if (!user.userId) return to("/sign-in");

  const requested = safeRedirectPath(url.searchParams.get("redirect_url"));

  if (user.isSuperAdmin) return to(requested ?? "/admin/questions");
  if (user.orgId && user.orgRole === "org:admin") return to(requested ?? "/institute/dashboard");

  try {
    const student = await getStudentById(user.userId);
    if (!student?.onboardingCompleted) return to("/student/onboarding");
  } catch (err) {
    // If the profile lookup fails, still let the student in; the dashboard handles errors.
    console.error("post-auth: student lookup failed", err);
  }

  return to(requested ?? "/student/dashboard");
}
