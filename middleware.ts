import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { resolveSuperAdmin } from "@/lib/security/auth";

// Platform admin area. Restricted to super admins because questions are not yet
// scoped to an institute: an institute (org) admin must not be able to read, approve
// or delete another institute's questions. Any signed-in user can create an org and
// become its org:admin, so org:admin alone must never unlock these routes.
const isSuperAdminRoute = createRouteMatcher([
  "/admin(.*)",
  "/api/admin(.*)",
]);

const isInstituteDashboardRoute = createRouteMatcher([
  "/institute/dashboard(.*)",
  "/api/institute(.*)",
]);

const isAuthRequiredRoute = createRouteMatcher([
  "/admin(.*)",
  "/api/admin(.*)",
  "/institute(.*)",
  "/api/institute(.*)",
  "/student(.*)",
  "/api/student(.*)",
  // Calls Gemini on every request, so it must not be open to anonymous traffic.
  "/api/generate-mock-test(.*)",
]);

function forbidden(isApi: boolean, req: Request, message: string, pageRedirect: string) {
  if (isApi) {
    return NextResponse.json({ error: message }, { status: 403 });
  }
  return NextResponse.redirect(new URL(pageRedirect, req.url));
}

export default clerkMiddleware(async (auth, req) => {
  if (!isAuthRequiredRoute(req)) return;

  const session = await auth();
  const isApi = req.nextUrl.pathname.startsWith("/api/");

  // 1. Unauthenticated check
  if (!session.userId) {
    if (isApi) {
      return NextResponse.json({ error: "Unauthorized: Please sign in" }, { status: 401 });
    }
    return session.redirectToSignIn({ returnBackUrl: req.url });
  }

  const needsAdminCheck = isSuperAdminRoute(req) || isInstituteDashboardRoute(req);
  const isSuperAdmin = needsAdminCheck
    ? await resolveSuperAdmin({ userId: session.userId, sessionClaims: session.sessionClaims })
    : false;

  // 2. Platform admin routes: super admins only
  if (isSuperAdminRoute(req) && !isSuperAdmin) {
    return forbidden(isApi, req, "Forbidden: Super Administrator access required", "/unauthorized");
  }

  // 3. Institute faculty dashboard
  if (isInstituteDashboardRoute(req) && !isSuperAdmin) {
    if (!session.orgId) {
      return forbidden(
        isApi,
        req,
        "Forbidden: Please select or join a Tuition / Institute workspace",
        "/institute/create"
      );
    }
    if (session.orgRole !== "org:admin") {
      return forbidden(
        isApi,
        req,
        "Forbidden: Institute Administrator / Faculty access required",
        "/student/dashboard"
      );
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
