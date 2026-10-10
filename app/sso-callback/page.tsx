import type { Metadata } from "next";
import { Suspense } from "react";
import { Logo } from "@/components/ui";
import { SsoCallbackClient } from "./sso-callback-client";

export const metadata: Metadata = {
  title: "Signing you in",
  robots: { index: false },
};

/** Google sends users back here after they approve Pariksha Studio. */
export default function SsoCallbackPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-public px-4 py-10">
      <Logo variant="public" href="/" label="Pariksha Studio home" />
      <main id="main" className="card card-lg w-full max-w-[460px]">
        <Suspense>
          <SsoCallbackClient />
        </Suspense>
      </main>
    </div>
  );
}
