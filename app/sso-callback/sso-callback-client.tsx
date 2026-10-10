"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
// HandleSSOCallback is exported by @clerk/react (the same copy @clerk/nextjs uses);
// @clerk/nextjs doesn't re-export it.
import { HandleSSOCallback } from "@clerk/react";
import { Loader2 } from "lucide-react";
import { Alert } from "@/components/ui";
import { PENDING_SESSION_MESSAGE, useAuthFinish } from "@/components/auth/use-auth-finish";

const SLOW_AFTER_MS = 15_000;

/**
 * Finishes a Google sign-in or sign-up after the redirect back from Google.
 * Clerk decides whether it became a sign-in or a sign-up (accounts are moved between
 * the two automatically); extra steps send the user back to the right form.
 */
export function SsoCallbackClient() {
  const [pendingError, setPendingError] = useState(false);
  const [slow, setSlow] = useState(false);
  const { navigate } = useAuthFinish({ onPendingTask: () => setPendingError(true) });

  // If nothing has happened after a while (e.g. the page was opened directly),
  // offer a way back instead of spinning forever.
  useEffect(() => {
    const timer = window.setTimeout(() => setSlow(true), SLOW_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, []);

  if (pendingError) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="m-0 text-xl font-extrabold">We couldn&apos;t finish signing you in</h1>
        <Alert tone="error">{PENDING_SESSION_MESSAGE}</Alert>
        <Link href="/sign-in" className="btn btn-outline btn-lg btn-block">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 py-4 text-center" role="status" aria-live="polite">
      <Loader2 className="size-8 animate-spin text-brand" aria-hidden />
      <h1 className="m-0 text-base font-bold">Signing you in with Google…</h1>
      <p className="m-0 text-sm text-muted">This only takes a moment.</p>
      {slow && (
        <p className="m-0 mt-2 text-sm text-muted">
          Taking longer than expected?{" "}
          <Link href="/sign-in" className="font-bold underline">
            Go back to sign in
          </Link>
        </p>
      )}
      <HandleSSOCallback
        navigateToApp={navigate}
        navigateToSignIn={() => window.location.replace("/sign-in?continue=sso")}
        navigateToSignUp={() => window.location.replace("/sign-up?continue=sso")}
      />
      {/* Bot protection may be required to finish a Google sign-up */}
      <div id="clerk-captcha" data-cl-theme="light" data-cl-size="flexible" data-cl-language="en" />
    </div>
  );
}
