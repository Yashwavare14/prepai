import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { SignOutButton } from "@clerk/nextjs";
import { ShieldAlert } from "lucide-react";
import { ButtonLink, Logo, SkipLink } from "@/components/ui";

export const metadata: Metadata = {
  title: "No access",
  robots: { index: false },
};

/**
 * Shown when a signed-in user opens a page their role can't use
 * (design pattern: the centred card from exam-submitted.html).
 */
export default async function UnauthorizedPage() {
  const { userId, orgId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const identity = user?.primaryEmailAddress?.emailAddress || user?.fullName || null;

  let institute: string | null = null;
  if (orgId) {
    try {
      const client = await clerkClient();
      institute = (await client.organizations.getOrganization({ organizationId: orgId })).name;
    } catch {
      institute = null;
    }
  }

  return (
    <div className="min-h-screen bg-app">
      <SkipLink />
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-public items-center px-4 py-2.5 sm:px-6">
          <Logo variant="public" href="/" label="Pariksha Studio home" />
        </div>
      </header>

      <main id="main" className="mx-auto flex max-w-[640px] flex-col items-center px-4 py-12 sm:py-16">
        <section className="card card-lg flex w-full flex-col items-center gap-3 text-center" aria-labelledby="denied-h">
          <div className="flex size-14 items-center justify-center rounded-pill bg-bad-bg" aria-hidden="true">
            <ShieldAlert className="size-7 text-bad-fg" />
          </div>
          <h1 id="denied-h" className="m-0 text-[28px] leading-tight font-extrabold tracking-[-0.02em]">
            You don&apos;t have access to this page
          </h1>
          <p className="m-0 max-w-[460px] text-muted">
            This area is for a different role. If you think you should have access, ask your institute admin or
            Pariksha Studio support.
          </p>

          {identity && (
            <dl className="m-0 mt-2 grid w-full gap-1 rounded-btn bg-app px-4 py-3 text-left text-sm">
              <div className="flex flex-wrap justify-between gap-2">
                <dt className="font-semibold text-muted">Signed in as</dt>
                <dd className="m-0 truncate font-semibold">{identity}</dd>
              </div>
              {institute && (
                <div className="flex flex-wrap justify-between gap-2">
                  <dt className="font-semibold text-muted">Institute</dt>
                  <dd className="m-0 truncate font-semibold">{institute}</dd>
                </div>
              )}
            </dl>
          )}

          <div className="mt-3 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/post-auth" variant="primary">
              Go to my dashboard
            </ButtonLink>
            <SignOutButton redirectUrl="/sign-in">
              <button type="button" className="btn btn-outline">
                Sign in with a different account
              </button>
            </SignOutButton>
          </div>
        </section>
      </main>
    </div>
  );
}
