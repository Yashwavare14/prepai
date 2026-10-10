import * as React from "react";
import { Logo, SkipLink } from "@/components/ui";
import { cn } from "@/lib/cn";

export interface AuthShellProps {
  /** Headline on the gradient panel. */
  title: string;
  /** Supporting line on the gradient panel. */
  subtitle: string;
  /** Benefit lines shown with a check mark. */
  points: string[];
  /** Small print at the bottom of the panel. */
  footnote: string;
  skipLabel?: string;
  /** Max width of the form column (sign-in 460px, sign-up 480px). */
  formWidth?: "sm" | "md";
  children: React.ReactNode;
}

/**
 * Split layout for sign-in, sign-up and password reset (design: login.html, register.html).
 * Wide screens: gradient story panel on the left, form card on the right.
 * Below 900px: the panel becomes a compact header and the points move under the form.
 */
export function AuthShell({
  title,
  subtitle,
  points,
  footnote,
  skipLabel = "Skip to form",
  formWidth = "sm",
  children,
}: AuthShellProps) {
  const pointsList = (onDark: boolean) => (
    <ul className={cn("m-0 grid list-none gap-3 p-0 text-base", onDark ? "text-white" : "text-ink-soft")}>
      {points.map((point) => (
        <li key={point}>✓ {point}</li>
      ))}
    </ul>
  );

  return (
    <div className="flex min-h-screen flex-col bg-public min-[900px]:flex-row">
      <SkipLink href="#main">{skipLabel}</SkipLink>

      <aside
        className="flex flex-col justify-between gap-8 px-6 py-8 text-white min-[900px]:flex-[1_1_420px] min-[900px]:px-10 min-[900px]:py-12"
        style={{ background: "var(--ps-gradient-auth)" }}
      >
        <Logo variant="auth" href="/" label="Pariksha Studio, back to home" />

        <div>
          <h1 className="m-0 mb-4 text-[28px] leading-[1.15] font-extrabold tracking-[-0.02em] min-[900px]:text-h1-auth">
            {title}
          </h1>
          <p className="m-0 max-w-[460px] text-base leading-relaxed text-indigo-150 min-[900px]:mb-6 min-[900px]:text-lead">
            {subtitle}
          </p>
          <div className="hidden min-[900px]:block">{pointsList(true)}</div>
        </div>

        <p className="m-0 hidden text-[13px] text-indigo-200 min-[900px]:block">{footnote}</p>
      </aside>

      <main
        id="main"
        className="flex flex-1 items-start justify-center px-4 py-8 min-[900px]:flex-[1_1_480px] min-[900px]:items-center min-[900px]:px-6 min-[900px]:py-10"
      >
        <div className={cn("flex w-full flex-col gap-5", formWidth === "sm" ? "max-w-[460px]" : "max-w-auth")}>
          {children}
          <div className="min-[900px]:hidden">
            {pointsList(false)}
            <p className="m-0 mt-4 text-[13px] text-muted">{footnote}</p>
          </div>
        </div>
      </main>
    </div>
  );
}

/** White form card used inside AuthShell (20px radius, 32px padding). */
export function AuthCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <section className="card rounded-card-lg p-6 sm:p-8" aria-labelledby="auth-card-title">
      <h2 id="auth-card-title" className="m-0 mb-1 text-card-title">
        {title}
      </h2>
      {description && <p className="m-0 mb-5 text-muted">{description}</p>}
      {children}
      {footer && <p className="m-0 mt-5 text-center text-muted">{footer}</p>}
    </section>
  );
}
