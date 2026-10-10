/**
 * Turns Clerk error codes into plain-English copy for the custom auth forms.
 * Clerk returns either a ClerkAPIResponseError (with an `errors` array) or a ClerkError
 * (with a `code`). Messages never reveal whether an account exists on sign-in.
 */

type ClerkLikeError = {
  code?: string;
  message?: string;
  longMessage?: string;
  errors?: Array<{ code?: string; message?: string; longMessage?: string; meta?: { paramName?: string } }>;
};

export const SIGN_IN_MISMATCH =
  "That email and password do not match. Check them and try again, or reset your password.";

const MESSAGES: Record<string, string> = {
  form_password_incorrect: SIGN_IN_MISMATCH,
  form_identifier_not_found: SIGN_IN_MISMATCH,
  strategy_for_user_invalid: SIGN_IN_MISMATCH,
  form_identifier_exists: "An account with this email already exists. Sign in instead.",
  form_password_pwned:
    "This password has appeared in a data breach elsewhere. Choose a different password to keep your account safe.",
  form_password_length_too_short: "Use 8 or more characters with a letter and a number.",
  form_password_validation_failed: "Use 8 or more characters with a letter and a number.",
  form_param_format_invalid: "Enter a valid email address.",
  form_code_incorrect: "That code is not right. Check the email we sent and try again.",
  verification_failed: "That code is not right. Check the email we sent and try again.",
  verification_expired: "That code has expired. Send a new code and try again.",
  too_many_requests: "Too many attempts. Please wait a few minutes and try again.",
  user_locked: "Too many attempts. Your account is locked for a short while. Please try again later.",
  captcha_invalid: "We couldn't confirm you're not a robot. Refresh the page and try again.",
  captcha_unavailable: "We couldn't confirm you're not a robot. Refresh the page and try again.",
  network_error: "We couldn't reach the server. Check your connection and try again.",
};

const FALLBACK = "Something went wrong. Please try again.";

/** First error code in a Clerk error, if any. */
export function clerkErrorCode(error: unknown): string | undefined {
  const e = error as ClerkLikeError | null | undefined;
  return e?.errors?.[0]?.code ?? e?.code ?? undefined;
}

/** A user-facing message for a Clerk error. */
export function clerkErrorMessage(error: unknown, fallback: string = FALLBACK): string {
  if (!error) return fallback;
  const code = clerkErrorCode(error);
  if (code && MESSAGES[code]) return MESSAGES[code];
  const e = error as ClerkLikeError;
  return e.errors?.[0]?.longMessage ?? e.errors?.[0]?.message ?? e.longMessage ?? fallback;
}

/** A field-level Clerk error ({ code, message }) as user-facing copy. */
export function clerkFieldMessage(fieldError: { code: string; message: string; longMessage?: string } | null | undefined) {
  if (!fieldError) return null;
  return MESSAGES[fieldError.code] ?? fieldError.longMessage ?? fieldError.message;
}

/**
 * Only allow same-origin relative paths as post-sign-in destinations, so a crafted
 * `redirect_url` can't send users to another site.
 */
export function safeRedirectPath(value: string | null | undefined): string | null {
  if (!value) return null;
  let path = value;
  try {
    // Clerk passes absolute URLs; keep only the path when it's our own origin.
    if (/^https?:\/\//i.test(value)) {
      if (typeof window === "undefined") return null;
      const url = new URL(value);
      if (url.origin !== window.location.origin) return null;
      path = url.pathname + url.search + url.hash;
    }
  } catch {
    return null;
  }
  if (!path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) return null;
  if (/^\/(sign-in|sign-up|forgot-password|post-auth)(\/|\?|$)/.test(path)) return null;
  return path;
}
