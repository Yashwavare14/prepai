"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth, useSignUp } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Alert, Button, Checkbox, Field, Input, Select } from "@/components/ui";
import { AuthCard } from "@/components/shells/auth-shell";
import { clerkErrorCode, clerkErrorMessage } from "@/lib/auth/clerk-errors";
import { INSTITUTE_JOIN_ENABLED, SIGNUP_EXAMS, SIGNUP_EXAM_VALUES } from "@/lib/constants/signup";
import { PENDING_SESSION_MESSAGE, useAuthFinish } from "./use-auth-finish";

const PASSWORD_HINT = "Use 8 or more characters with a letter and a number.";
const RESEND_SECONDS = 30;

const signUpSchema = z.object({
  fullName: z.string().trim().min(1, "Enter your full name.").max(100, "Use 100 characters or fewer."),
  email: z.string().trim().pipe(z.email("Enter a valid email address.")),
  password: z
    .string()
    .min(8, PASSWORD_HINT)
    .max(128, "Use 128 characters or fewer.")
    .regex(/[A-Za-z]/, PASSWORD_HINT)
    .regex(/\d/, PASSWORD_HINT),
  targetExam: z.enum(SIGNUP_EXAM_VALUES),
  instituteCode: z
    .string()
    .trim()
    .max(40, "Institute codes are 40 characters or fewer.")
    .regex(/^[A-Za-z0-9-]*$/, "Use only letters, numbers and dashes.")
    .optional(),
  terms: z.boolean().refine((v) => v, "Please accept the terms of use and privacy policy to continue."),
});

type SignUpValues = z.infer<typeof signUpSchema>;

/**
 * Sign-up form (design: register.html) followed by an email verification code step.
 * The target exam is stored in Clerk unsafeMetadata and pre-fills the student profile.
 */
export function SignUpForm() {
  const { signUp, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const { navigate, goToDashboard } = useAuthFinish({
    onPendingTask: () => {
      setFinishing(false);
      setFormError(PENDING_SESSION_MESSAGE);
    },
  });

  const [step, setStep] = useState<"details" | "verify">("details");
  const [formError, setFormError] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [codeNotice, setCodeNotice] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [finishing, setFinishing] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { fullName: "", email: "", password: "", targetExam: "SSC CGL", instituteCode: "", terms: false },
    mode: "onTouched",
  });

  // Already signed in: skip the form. Not while finishing our own sign-up,
  // because finalize() is already navigating.
  useEffect(() => {
    if (isSignedIn && !finishing) goToDashboard();
  }, [isSignedIn, finishing, goToDashboard]);

  // Resend cooldown ticker
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const busy = fetchStatus === "fetching" || finishing || isSubmitting;

  async function finish() {
    setFinishing(true);
    const { error } = await signUp.finalize({ navigate });
    if (error) {
      setFinishing(false);
      setFormError(clerkErrorMessage(error));
    }
  }

  async function sendCode() {
    const { error } = await signUp.verifications.sendEmailCode();
    if (error) {
      setFormError(clerkErrorMessage(error));
      return false;
    }
    setCooldown(RESEND_SECONDS);
    return true;
  }

  async function onSubmit(values: SignUpValues) {
    setFormError(null);
    const [firstName, ...rest] = values.fullName.trim().split(/\s+/);

    const { error } = await signUp.password({
      emailAddress: values.email.trim(),
      password: values.password,
      firstName,
      lastName: rest.join(" ") || undefined,
      unsafeMetadata: {
        targetExam: values.targetExam,
        termsAcceptedAt: new Date().toISOString(),
        // Institute codes are re-validated on the server before anyone joins an institute.
        ...(INSTITUTE_JOIN_ENABLED && values.instituteCode ? { instituteCode: values.instituteCode.toUpperCase() } : {}),
      },
    });

    if (error) {
      const code = clerkErrorCode(error);
      const message = clerkErrorMessage(error);
      if (code === "form_identifier_exists" || code === "form_param_format_invalid") {
        setError("email", { message });
      } else if (code?.startsWith("form_password")) {
        setError("password", { message });
      } else {
        setFormError(message);
      }
      return;
    }

    if (signUp.status === "complete") return finish();

    if (signUp.unverifiedFields.includes("email_address")) {
      if (await sendCode()) {
        setCode("");
        setCodeError(null);
        setCodeNotice(null);
        setStep("verify");
      }
      return;
    }

    setFormError(clerkErrorMessage(null));
  }

  async function onVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCodeError(null);
    setFormError(null);
    const value = code.replace(/\s/g, "");
    if (!/^\d{6}$/.test(value)) return setCodeError("Enter the 6-digit code from the email.");

    const { error } = await signUp.verifications.verifyEmailCode({ code: value });
    if (error) return setCodeError(clerkErrorMessage(error));
    if (signUp.status === "complete") return finish();
    setFormError(clerkErrorMessage(null));
  }

  async function onResend() {
    setCodeError(null);
    setFormError(null);
    if (await sendCode()) setCodeNotice("We sent a new code. It can take a minute to arrive.");
  }

  async function useDifferentEmail() {
    await signUp.reset();
    setStep("details");
    setFormError(null);
  }

  if (step === "verify") {
    return (
      <AuthCard
        title="Check your email"
        description={
          <>
            We sent a 6-digit code to <strong className="text-ink">{getValues("email").trim()}</strong>. Enter it to
            finish creating your account.
          </>
        }
      >
        <form onSubmit={onVerify} noValidate className="flex flex-col gap-4">
          <Field id="signup-code" label="6-digit code" error={codeError}>
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
          {codeNotice && <Alert tone="success">{codeNotice}</Alert>}
          {formError && <Alert tone="error">{formError}</Alert>}
          <Button type="submit" size="lg" block loading={busy} loadingText="Verifying…">
            Verify and continue
          </Button>
          <div className="flex flex-wrap justify-between gap-2">
            <button type="button" className="btn-link" onClick={onResend} disabled={busy || cooldown > 0}>
              {cooldown > 0 ? `Send a new code in ${cooldown}s` : "Send a new code"}
            </button>
            <button type="button" className="btn-link" onClick={useDifferentEmail} disabled={busy}>
              Use a different email
            </button>
          </div>
        </form>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create your free account"
      description="Takes under a minute."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/sign-in" className="font-bold underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <Field id="signup-name" label="Full name" error={errors.fullName?.message}>
          <Input size="lg" type="text" autoComplete="name" {...register("fullName")} />
        </Field>

        <Field id="signup-email" label="Email" error={errors.email?.message}>
          <Input size="lg" type="email" autoComplete="email" {...register("email")} />
        </Field>

        <Field id="signup-password" label="Password" hint={PASSWORD_HINT} error={errors.password?.message}>
          <Input size="lg" type="password" autoComplete="new-password" {...register("password")} />
        </Field>

        <Field id="signup-exam" label="Which exam are you preparing for?" error={errors.targetExam?.message}>
          <Select size="lg" {...register("targetExam")}>
            {SIGNUP_EXAMS.map((exam) => (
              <option key={exam.value} value={exam.value}>
                {exam.label}
              </option>
            ))}
          </Select>
        </Field>

        {INSTITUTE_JOIN_ENABLED && (
          <Field
            id="signup-institute"
            label="Institute code"
            optional
            hint="Studying at a coaching institute? Enter the code they gave you."
            error={errors.instituteCode?.message}
          >
            <Input
              size="lg"
              type="text"
              placeholder="e.g. BRIGHT-2026"
              autoCapitalize="characters"
              {...register("instituteCode")}
            />
          </Field>
        )}

        <div>
          <Checkbox
            alignTop
            label="I agree to the terms of use and privacy policy."
            aria-invalid={errors.terms ? true : undefined}
            aria-describedby={errors.terms ? "signup-terms-error" : undefined}
            {...register("terms")}
          />
          {errors.terms && (
            <p id="signup-terms-error" className="field-error m-0">
              {errors.terms.message}
            </p>
          )}
          {/* Clerk bot protection (Smart CAPTCHA) mounts here. Kept inside this block so
              the empty element doesn't add a gap to the form layout. */}
          <div id="clerk-captcha" data-cl-theme="light" data-cl-size="flexible" data-cl-language="en" className="mt-2 empty:mt-0" />
        </div>

        {formError && <Alert tone="error">{formError}</Alert>}

        <Button type="submit" size="lg" block loading={busy} loadingText="Creating your account…">
          Create free account
        </Button>
      </form>
    </AuthCard>
  );
}
