import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/shells/auth-shell";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to book exam slots, take real exam-style mocks and see exactly what to improve.",
};

export default function SignInPage() {
  return (
    <AuthShell
      title="Welcome back. Your next rank starts with one mock test."
      subtitle="Sign in to book exam slots, take real exam-style mocks and see exactly what to improve."
      points={[
        "One sign-in for students and institutes",
        "Your institute's branding appears automatically",
        "Results and progress saved on every device",
      ]}
      footnote="Free mock tests for SSC CGL, Banking and Railways."
      skipLabel="Skip to sign in form"
    >
      {/* useSearchParams (redirect_url) needs a Suspense boundary */}
      <Suspense>
        <SignInForm />
      </Suspense>
    </AuthShell>
  );
}
