import { auth, currentUser } from "@clerk/nextjs/server";

// Comma-separated list of emails that are granted platform super-admin privileges
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

/**
 * Checks if a given email is listed in ADMIN_EMAILS
 */
export function isSuperAdminEmail(email) {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

/**
 * Retrieves the full authentication context for the current user:
 * - userId: Clerk User ID
 * - orgId: Current active Tuition / Institute Organization ID (if any)
 * - orgRole: 'org:admin' (faculty/owner) | 'org:member' (student) | null
 * - orgSlug: Organization URL slug
 * - isSuperAdmin: true if listed in ADMIN_EMAILS or user.publicMetadata.role === 'admin'
 * - isInstituteAdmin: true if isSuperAdmin OR orgRole === 'org:admin'
 * - isStudent: true if not super admin and not institute admin (or orgRole === 'org:member')
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
      email: null,
    };
  }

  // Check role from session claims (Clerk publicMetadata)
  const metadataRole = sessionClaims?.metadata?.role || sessionClaims?.role;

  // Check email for super admin fallback
  let email = null;
  let isSuperAdmin = metadataRole === "admin" || metadataRole === "super_admin";

  if (!isSuperAdmin && ADMIN_EMAILS.length > 0) {
    try {
      const user = await currentUser();
      email = user?.primaryEmailAddress?.emailAddress || null;
      if (email && isSuperAdminEmail(email)) {
        isSuperAdmin = true;
      }
    } catch (e) {
      console.warn("Could not fetch currentUser in getAuthUser", e);
    }
  }

  const isInstituteAdmin = isSuperAdmin || orgRole === "org:admin";
  const isStudent = !isSuperAdmin && (orgRole === "org:member" || !orgRole);

  const effectiveRole = isSuperAdmin
    ? "super_admin"
    : isInstituteAdmin
    ? "institute_admin"
    : "student";

  return {
    userId,
    orgId: orgId || null,
    orgRole: orgRole || null,
    orgSlug: orgSlug || null,
    role: effectiveRole,
    isSuperAdmin,
    isInstituteAdmin,
    isStudent,
    email,
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
