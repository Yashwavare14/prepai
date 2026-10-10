"use client";

import { useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { safeRedirectPath } from "@/lib/auth/clerk-errors";

type DecorateUrl = (url: string) => string;
type FinalizeSession = { status?: string; currentTask?: { key: string } | null };

/**
 * Message shown when Clerk leaves the session "pending" with a task to complete.
 * The usual cause is the Clerk dashboard requiring every user to belong to an
 * organization ("force organization selection"), which free students never do.
 */
export const PENDING_SESSION_MESSAGE =
  "We couldn't finish signing you in because your account setup isn't complete. Please contact Pariksha Studio support.";

/**
 * Builds the `navigate` callback for signIn.finalize() / signUp.finalize().
 * Every successful sign-in goes through /post-auth, which picks the right home
 * (admin console, onboarding or student dashboard) and honours a safe redirect_url.
 */
export function useAuthFinish(options: { onPendingTask?: (taskKey: string) => void } = {}) {
  const searchParams = useSearchParams();
  const { onPendingTask } = options;

  const destination = useCallback(() => {
    const next = safeRedirectPath(searchParams.get("redirect_url"));
    return next ? `/post-auth?redirect_url=${encodeURIComponent(next)}` : "/post-auth";
  }, [searchParams]);

  const navigate = useCallback(
    async ({ session, decorateUrl }: { session: FinalizeSession; decorateUrl: DecorateUrl }) => {
      // A pending session is treated as signed out on the server, so /post-auth would
      // send the user straight back to sign-in. Stop and explain instead.
      const task = session?.currentTask?.key;
      if (session?.status === "pending" || task) {
        console.error(
          `[auth] Clerk session is pending (task: ${task ?? "unknown"}). ` +
            "If the task is 'choose-organization', allow personal accounts in the Clerk dashboard " +
            "(Organizations settings) so students without an institute can sign in."
        );
        onPendingTask?.(task ?? "unknown");
        return;
      }
      // /post-auth is a route handler that answers with a redirect, so it needs a full
      // page load (client-side router.push doesn't follow it). decorateUrl may also
      // return an absolute URL for Safari's cookie refresh, which needs a full load too.
      window.location.assign(decorateUrl(destination()));
    },
    [destination, onPendingTask]
  );

  /**
   * URLs for signIn.sso() / signUp.sso(): Google returns to /sso-callback, which
   * finishes the flow and then continues to /post-auth like any other sign-in.
   */
  const ssoUrls = useCallback(() => {
    const origin = window.location.origin;
    return {
      redirectCallbackUrl: `${origin}/sso-callback`,
      redirectUrl: `${origin}${destination()}`,
    };
  }, [destination]);

  /** For pages that find the user already signed in. */
  const goToDashboard = useCallback(() => {
    window.location.replace("/post-auth");
  }, []);

  return { navigate, destination, goToDashboard, ssoUrls };
}
