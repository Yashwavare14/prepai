"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth, useSignIn } from "@clerk/nextjs";
import { Alert, Button, Checkbox, Field, Input } from "@/components/ui";
import { AuthCard } from "@/components/shells/auth-shell";
import { clerkErrorMessage } from "@/lib/auth/clerk-errors";
import { PENDING_SESSION_MESSAGE, useAuthFinish } from "./use-auth-finish";

type Step = "credentials" | "email-code" | "totp";

/**
 * Sign-in form (design: login.html). Email + password, with a second step when Clerk
 * asks for an emailed code (new device / two-step) or an authenticator code.
 */
export function SignInForm() {
  const { signIn, fetchStatus } = useSignIn();
  const { isSignedIn } = useAuth();
  const { navigate, goToDashboard } = useAuthFinish({
    onPendingTask: () => {
      setFinishing(false);
      setFormError(PENDING_SESSION_MESSAGE);
    },
  });

  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [finishing, setFinishing] = useState(false);

  // Already signed in: skip the form. Not while finishing our own sign-in,
  // because finalize() is already navigating.
  useEffect(() => {
    if (isSignedIn && !finishing) goToDashboard();
  }, [isSignedIn, finishing, goToDashboard]);

  const busy = fetchStatus === "fetching" || finishing;

  async function finish() {
    setFinishing(true);
    const { error } = await signIn.finalize({ navigate });
    if (error) {
      setFinishing(false);
      setFormError(clerkErrorMessage(error));
    }
  }

  async function continueAfterFirstFactor() {
    if (signIn.status === "complete") return finish();

    if (signIn.status === "needs_second_factor" || signIn.status === "needs_client_trust") {
      const strategies = signIn.supportedSecondFactors.map((f) => f.strategy);
      if (strategies.includes("email_code")) {
        const { error } = await signIn.mfa.sendEmailCode();
        if (error) return setFormError(clerkErrorMessage(error));
        setCode("");
        return setStep("email-code");
      }
      if (strategies.includes("totp")) {
        setCode("");
        return setStep("totp");
      }
    }

    setFormError("This account needs a sign-in method this page doesn't support yet. Please contact support.");
  }

  async function handleCredentials(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setEmailError(null);
    setPasswordError(null);

    const trimmed = email.trim();
    let invalid = false;
    if (!/^\S+@\S+\.\S+$/.test(trimmed)) {
      setEmailError("Enter the email address you signed up with.");
      invalid = true;
    }
    if (!password) {
      setPasswordError("Enter your password.");
      invalid = true;
    }
    if (invalid) return;

    const { error } = await signIn.password({ identifier: trimmed, password });
    if (error) return setFormError(clerkErrorMessage(error));
    await continueAfterFirstFactor();
  }

  async function handleCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    const value = code.replace(/\s/g, "");
    if (!/^\d{6}$/.test(value)) return setFormError("Enter the 6-digit code.");

    const { error } =
      step === "totp"
        ? await signIn.mfa.verifyTOTP({ code: value })
        : await signIn.mfa.verifyEmailCode({ code: value });
    if (error) return setFormError(clerkErrorMessage(error));
    if (signIn.status === "complete") return finish();
    setFormError(clerkErrorMessage(null));
  }

  async function resendCode() {
    setFormError(null);
    const { error } = await signIn.mfa.sendEmailCode();
    if (error) setFormError(clerkErrorMessage(error));
  }

  if (step !== "credentials") {
    return (
      <AuthCard
        title={step === "totp" ? "Enter your app code" : "Check your email"}
        description={
          step === "totp"
            ? "Open your authenticator app and enter the 6-digit code for Pariksha Studio."
            : `We sent a 6-digit code to ${email.trim()} to confirm it's you.`
        }
      >
        <form onSubmit={handleCode} noValidate className="flex flex-col gap-4">
          <Field id="signin-code" label="6-digit code">
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
          {formError && <Alert tone="error">{formError}</Alert>}
          <Button type="submit" size="lg" block loading={busy} loadingText="Checking…">
            Continue
          </Button>
          <div className="flex flex-wrap justify-between gap-2">
            {step === "email-code" && (
              <button type="button" className="btn-link" onClick={resendCode} disabled={busy}>
                Send a new code
              </button>
            )}
            <button
              type="button"
              className="btn-link"
              onClick={() => {
                setStep("credentials");
                setFormError(null);
              }}
            >
              Back to sign in
            </button>
          </div>
        </form>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Sign in"
      description="Students, institute students and institute admins all sign in here."
      footer={
        <>
          New here?{" "}
          <Link href="/sign-up" className="font-bold underline">
            Create a free account
          </Link>
        </>
      }
    >
      <form onSubmit={handleCredentials} noValidate className="flex flex-col gap-4">
        <Field id="signin-email" label="Email" error={emailError}>
          <Input
            size="lg"
            type="email"
            autoComplete="username"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <Field id="signin-password" label="Password" error={passwordError}>
          <Input
            size="lg"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <Checkbox
            label="Show password"
            checked={showPassword}
            onChange={(e) => setShowPassword(e.target.checked)}
          />
          <Link href="/forgot-password" className="btn-link inline-flex items-center">
            Forgot password?
          </Link>
        </div>

        {formError && <Alert tone="error">{formError}</Alert>}

        <Button type="submit" size="lg" block loading={busy} loadingText="Signing in…">
          Sign in
        </Button>
      </form>
    </AuthCard>
  );
}
