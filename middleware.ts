import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

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
]);

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export default clerkMiddleware(async (auth, req) => {
  if (isAuthRequiredRoute(req)) {
    const session = await auth();
    const isApi = req.nextUrl.pathname.startsWith("/api/");

    // 1. Unauthenticated check
    if (!session.userId) {
      if (isApi) {
        return NextResponse.json({ error: "Unauthorized: Please sign in" }, { status: 401 });
      }
      return session.redirectToSignIn({ returnBackUrl: req.url });
    }

    type SessionClaimsWithRole = {
      metadata?: { role?: string };
      role?: string;
      email?: string;
    };
    const claims = session.sessionClaims as unknown as SessionClaimsWithRole;
    const metadataRole = claims?.metadata?.role || claims?.role;
    const userEmail = claims?.email?.toLowerCase();
    const isSuperAdmin =
      metadataRole === "admin" ||
      metadataRole === "super_admin" ||
      (userEmail && ADMIN_EMAILS.includes(userEmail));
    const isInstituteAdmin = isSuperAdmin || session.orgRole === "org:admin";

    // 2. Admin routes check (Super Admin or Institute Admin)
    if (isSuperAdminRoute(req)) {
      if (!isSuperAdmin && !isInstituteAdmin) {
        if (isApi) {
          return NextResponse.json(
            { error: "Forbidden: Administrator or Faculty privileges required" },
            { status: 403 }
          );
        }
        const unauthorizedUrl = new URL("/unauthorized", req.url);
        return NextResponse.redirect(unauthorizedUrl);
      }
    }

    // 3. Institute faculty dashboard check
    if (isInstituteDashboardRoute(req)) {
      if (!session.orgId && !isSuperAdmin) {
        // No organization selected: redirect to registration/selection
        const createOrgUrl = new URL("/institute/create", req.url);
        return NextResponse.redirect(createOrgUrl);
      }

      if (!isInstituteAdmin) {
        // Enrolled student trying to access faculty dashboard -> redirect to student dashboard
        const studentDashboardUrl = new URL("/student/dashboard", req.url);
        return NextResponse.redirect(studentDashboardUrl);
      }
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
