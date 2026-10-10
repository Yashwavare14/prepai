import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/shells/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Reset your password",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Welcome back. Your next rank starts with one mock test."
      subtitle="Reset your password in a minute and pick up where you left off."
      points={[
        "One sign-in for students and institutes",
        "Your institute's branding appears automatically",
        "Results and progress saved on every device",
      ]}
      footnote="Free mock tests for SSC CGL, Banking and Railways."
      skipLabel="Skip to password reset form"
    >
      <Suspense>
        <ForgotPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
