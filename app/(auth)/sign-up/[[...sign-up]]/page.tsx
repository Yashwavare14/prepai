import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/shells/auth-shell";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { INSTITUTE_JOIN_ENABLED } from "@/lib/constants/signup";

export const metadata: Metadata = {
  title: "Create your free account",
  description:
    "Join thousands of aspirants preparing for SSC CGL, Banking and Railways exams with exam-style mock tests and instant analysis.",
};

export default function SignUpPage() {
  return (
    <AuthShell
      title="Start free. Practise like it is the real exam."
      subtitle="Join thousands of aspirants preparing for SSC CGL, Banking and Railways exams with exam-style mock tests and instant analysis."
      points={[
        "Free starter mock test, no card needed",
        "Detailed answers and explanations",
        // The institute-code line only makes sense once the code field is enabled (Phase 3).
        INSTITUTE_JOIN_ENABLED
          ? "Studying at a coaching institute? Add your code and see your institute's exams"
          : "Instant results with percentile ranking",
      ]}
      footnote="Your details are private and never sold."
      skipLabel="Skip to sign-up form"
      formWidth="md"
    >
      <Suspense>
        <SignUpForm />
      </Suspense>
    </AuthShell>
  );
}
