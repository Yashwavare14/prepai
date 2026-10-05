import { auth, clerkClient } from "@clerk/nextjs/server";

// Comma-separated list of emails that are granted platform super-admin privileges
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const SUPER_ADMIN_ROLES = new Set(["admin", "super_admin"]);

// Short-lived cache so admin checks don't call the Clerk API on every request.
const USER_CACHE_TTL_MS = 60_000;
const userCache = new Map(); // userId -> { isSuperAdmin, email, expires }

/**
 * Checks if a given email is listed in ADMIN_EMAILS
 */
export function isSuperAdminEmail(email) {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

function roleFromClaims(sessionClaims) {
  return sessionClaims?.metadata?.role || sessionClaims?.role || null;
}

/**
 * Looks the user up in Clerk and decides whether they are a platform super admin.
 * Grants access when publicMetadata.role is admin/super_admin, or when the user's
 * primary email is verified and listed in ADMIN_EMAILS.
 */
async function lookupSuperAdmin(userId) {
  const cached = userCache.get(userId);
  if (cached && cached.expires > Date.now()) return cached;

  let result = { isSuperAdmin: false, email: null };
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const primary = user.emailAddresses?.find((e) => e.id === user.primaryEmailAddressId);
    const email = primary?.emailAddress?.toLowerCase() || null;
    const emailVerified = primary?.verification?.status === "verified";

    result = {
      email,
      isSuperAdmin:
        SUPER_ADMIN_ROLES.has(user.publicMetadata?.role) ||
        Boolean(email && emailVerified && isSuperAdminEmail(email)),
    };
  } catch (e) {
    // Fail closed: if Clerk can't be reached, the user is not treated as an admin.
    console.warn("Could not look up Clerk user for admin check", e);
    return result;
  }

  if (userCache.size > 1000) userCache.clear();
  userCache.set(userId, { ...result, expires: Date.now() + USER_CACHE_TTL_MS });
  return result;
}

/**
 * Decides whether a signed-in user is a platform super admin.
 * Safe to call from middleware and from route handlers.
 */
export async function resolveSuperAdmin({ userId, sessionClaims }) {
  if (!userId) return false;
  if (SUPER_ADMIN_ROLES.has(roleFromClaims(sessionClaims))) return true;
  // The default Clerk session token carries neither the email nor publicMetadata,
  // so fall back to a (cached) Clerk API lookup.
  const { isSuperAdmin } = await lookupSuperAdmin(userId);
  return isSuperAdmin;
}

/**
 * Retrieves the full authentication context for the current user:
 * - userId: Clerk User ID
 * - orgId: Current active Tuition / Institute Organization ID (if any)
 * - orgRole: 'org:admin' (faculty/owner) | 'org:member' (student) | null
 * - orgSlug: Organization URL slug
 * - isSuperAdmin: platform admin (publicMetadata.role or verified email in ADMIN_EMAILS)
 * - isInstituteAdmin: true if isSuperAdmin OR orgRole === 'org:admin'
 * - isStudent: true if not super admin and not institute admin
 */
export async function getAuthUser() {
  const { userId, orgId, orgRole, orgSlug, sessionClaims } = await auth();

  if (!userId) {
    return {
      userId: null,
      orgId: null,
      orgRole: null,
      orgSlug: null,
      role: null,
      isSuperAdmin: false,
      isInstituteAdmin: false,
      isStudent: false,
    };
  }

  const isSuperAdmin = await resolveSuperAdmin({ userId, sessionClaims });
  const isInstituteAdmin = isSuperAdmin || orgRole === "org:admin";
  const isStudent = !isInstituteAdmin;

  return {
    userId,
    orgId: orgId || null,
    orgRole: orgRole || null,
    orgSlug: orgSlug || null,
    role: isSuperAdmin ? "super_admin" : isInstituteAdmin ? "institute_admin" : "student",
    isSuperAdmin,
    isInstituteAdmin,
    isStudent,
  };
}

/**
 * Guard: Requires any authenticated user session (returns 401 response if unauthenticated)
 */
export async function requireAuth() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized: Please sign in" }, { status: 401 });
  }
  return null;
}

/**
 * Guard: Requires Platform Super Admin privileges (returns 403 response if forbidden)
 */
export async function requireSuperAdmin() {
  const user = await getAuthUser();
  if (!user.userId) {
    return Response.json({ error: "Unauthorized: Please sign in" }, { status: 401 });
  }
  if (!user.isSuperAdmin) {
    return Response.json(
      { error: "Forbidden: Super Administrator access required" },
      { status: 403 }
    );
  }
  return null;
}

/**
 * Guard: Requires Tuition / Institute Admin privileges (or Super Admin)
 */
export async function requireInstituteAdmin() {
  const user = await getAuthUser();
  if (!user.userId) {
    return Response.json({ error: "Unauthorized: Please sign in" }, { status: 401 });
  }
  if (!user.isInstituteAdmin) {
    return Response.json(
      { error: "Forbidden: Institute Administrator / Faculty access required" },
      { status: 403 }
    );
  }
  return null;
}

/**
 * Guard: Requires an active tuition / organization context
 */
export async function requireOrganization() {
  const user = await getAuthUser();
  if (!user.userId) {
    return Response.json({ error: "Unauthorized: Please sign in" }, { status: 401 });
  }
  if (!user.orgId && !user.isSuperAdmin) {
    return Response.json(
      { error: "Forbidden: Please select or join a Tuition / Institute workspace" },
      { status: 403 }
    );
  }
  return null;
}
