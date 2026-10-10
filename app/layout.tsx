import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Providers from "./providers";
import "katex/dist/katex.min.css";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Free SSC CGL Mock Tests Online | Pariksha Studio",
    template: "%s | Pariksha Studio",
  },
  description:
    "Take free SSC CGL, Banking and Railways mock tests online. Real exam interface, instant results, percentile ranking and detailed solutions. Book a slot and start practising today.",
  applicationName: "Pariksha Studio",
  openGraph: {
    title: "Free SSC CGL Mock Tests Online | Pariksha Studio",
    description: "Real exam-style mock tests with instant results, percentile and solutions. Start free.",
    type: "website",
    siteName: "Pariksha Studio",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/post-auth"
      signUpFallbackRedirectUrl="/post-auth"
    >
      <html lang="en" className={`${jakarta.variable} h-full`}>
        <body className="min-h-full flex flex-col">
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
