"use client";

import { useState } from "react";
import Link from "next/link";
import { useSignIn } from "@clerk/nextjs";
import { Alert, Button, Checkbox, Field, Input } from "@/components/ui";
import { AuthCard } from "@/components/shells/auth-shell";
import { clerkErrorCode, clerkErrorMessage } from "@/lib/auth/clerk-errors";
import { PENDING_SESSION_MESSAGE, useAuthFinish } from "./use-auth-finish";

const PASSWORD_HINT = "Use 8 or more characters with a letter and a number.";

function validPassword(value: string) {
  return value.length >= 8 && /[A-Za-z]/.test(value) && /\d/.test(value);
}

/**
 * Password reset: email -> emailed code + new password -> signed in.
 * Uses Clerk's reset_password_email_code strategy.
 */
export function ForgotPasswordForm() {
  const { signIn, fetchStatus } = useSignIn();
  const { navigate } = useAuthFinish({
    onPendingTask: () => {
      setFinishing(false);
      setFormError(PENDING_SESSION_MESSAGE);
    },
  });

  const [step, setStep] = useState<"email" | "reset" | "done">("email");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [codeVerified, setCodeVerified] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [finishing, setFinishing] = useState(false);

  const busy = fetchStatus === "fetching" || finishing;

  async function sendResetCode() {
    const created = await signIn.create({ identifier: email.trim() });
    if (created.error) {
      const code = clerkErrorCode(created.error);
      if (code === "form_identifier_not_found") {
        setEmailError("We couldn't find an account with that email. Check it, or create a free account.");
      } else {
        setFormError(clerkErrorMessage(created.error));
      }
      return false;
    }
    const sent = await signIn.resetPasswordEmailCode.sendCode();
    if (sent.error) {
      setFormError(clerkErrorMessage(sent.error));
      return false;
    }
    return true;
  }

  async function onEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEmailError(null);
    setFormError(null);
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setEmailError("Enter the email address you signed up with.");
    if (await sendResetCode()) {
      setCode("");
      setCodeVerified(false);
      setStep("reset");
    }
  }

  async function onReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCodeError(null);
    setPasswordError(null);
    setFormError(null);
    setNotice(null);

    const value = code.replace(/\s/g, "");
    let invalid = false;
    if (!codeVerified && !/^\d{6}$/.test(value)) {
      setCodeError("Enter the 6-digit code from the email.");
      invalid = true;
    }
    if (!validPassword(password)) {
      setPasswordError(PASSWORD_HINT);
      invalid = true;
    }
    if (invalid) return;

    // The code can only be used once, so don't re-verify after a password error.
    if (!codeVerified) {
      const verified = await signIn.resetPasswordEmailCode.verifyCode({ code: value });
      if (verified.error) return setCodeError(clerkErrorMessage(verified.error));
      setCodeVerified(true);
    }

    const submitted = await signIn.resetPasswordEmailCode.submitPassword({ password, signOutOfOtherSessions: true });
    if (submitted.error) {
      const code = clerkErrorCode(submitted.error);
      if (code?.startsWith("form_password")) return setPasswordError(clerkErrorMessage(submitted.error));
      return setFormError(clerkErrorMessage(submitted.error));
    }

    if (signIn.status === "complete") {
      setFinishing(true);
      const { error } = await signIn.finalize({ navigate });
      if (error) {
        setFinishing(false);
        setFormError(clerkErrorMessage(error));
      }
      return;
    }

    // e.g. two-step verification is on: the password is changed, sign in normally.
    setStep("done");
  }

  async function onResend() {
    setCodeError(null);
    setFormError(null);
    if (await sendResetCode()) {
      setCodeVerified(false);
      setNotice("We sent a new code. It can take a minute to arrive.");
    }
  }

  if (step === "done") {
    return (
      <AuthCard title="Password updated" description="Your new password is saved. Sign in to continue.">
        <Link href="/sign-in" className="btn btn-primary btn-lg btn-block">
          Go to sign in
        </Link>
      </AuthCard>
    );
  }

  if (step === "reset") {
    return (
      <AuthCard
        title="Choose a new password"
        description={
          <>
            We sent a 6-digit code to <strong className="text-ink">{email.trim()}</strong>.
          </>
        }
      >
        <form onSubmit={onReset} noValidate className="flex flex-col gap-4">
          {!codeVerified && (
            <Field id="reset-code" label="6-digit code" error={codeError}>
              <Input
                size="lg"
                className="code-input"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                autoFocus
              />
            </Field>
          )}
          <Field id="reset-password" label="New password" hint={PASSWORD_HINT} error={passwordError}>
            <Input
              size="lg"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <Checkbox label="Show password" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} />
          {notice && <Alert tone="success">{notice}</Alert>}
          {formError && <Alert tone="error">{formError}</Alert>}
          <Button type="submit" size="lg" block loading={busy} loadingText="Saving…">
            Save new password
          </Button>
          <div className="flex flex-wrap justify-between gap-2">
            {!codeVerified && (
              <button type="button" className="btn-link" onClick={onResend} disabled={busy}>
                Send a new code
              </button>
            )}
            <button type="button" className="btn-link" onClick={() => setStep("email")} disabled={busy}>
              Use a different email
            </button>
          </div>
        </form>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Reset your password"
      description="Enter the email you signed up with and we'll send you a code."
      footer={
        <>
          Remembered it?{" "}
          <Link href="/sign-in" className="font-bold underline">
            Back to sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onEmail} noValidate className="flex flex-col gap-4">
        <Field id="reset-email" label="Email" error={emailError}>
          <Input
            size="lg"
            type="email"
            autoComplete="username"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        {formError && <Alert tone="error">{formError}</Alert>}
        <Button type="submit" size="lg" block loading={busy} loadingText="Sending code…">
          Send reset code
        </Button>
      </form>
    </AuthCard>
  );
}
