import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export type LogoVariant = "public" | "auth" | "console" | "portal";

export interface LogoProps {
  variant?: LogoVariant;
  href?: string;
  /** Accessible name for the link, e.g. "Pariksha Studio home". */
  label?: string;
  /** Product or institute name. */
  name?: string;
  /** Second line under the name (console: "Admin console", portal: tagline). */
  subtitle?: string;
  className?: string;
}

/**
 * The Pariksha Studio mark, in the four treatments used by the design:
 * - public:  gradient tile + "P" (landing header)
 * - auth:    white tile + brand "P" on the gradient auth panel
 * - console: gradient tile + check icon, with "Admin console" (admin sidebar)
 * - portal:  brand-colour tile + initial, with tagline (student portal, institute-branded)
 */
export function Logo({
  variant = "public",
  href = "/",
  label = "Pariksha Studio home",
  name = "Pariksha Studio",
  subtitle,
  className,
}: LogoProps) {
  const initial = name.trim().charAt(0).toUpperCase() || "P";

  const mark = {
    public: (
      <span
        className="flex size-10 items-center justify-center rounded-btn text-lg font-extrabold text-white"
        style={{ background: "var(--ps-gradient-logo)" }}
      >
        {initial}
      </span>
    ),
    auth: (
      <span className="flex size-11 items-center justify-center rounded-btn bg-white text-xl font-extrabold text-indigo-800">
        {initial}
      </span>
    ),
    console: (
      <span
        className="flex size-10 items-center justify-center rounded-btn"
        style={{ background: "var(--ps-gradient-logo-console)" }}
      >
        <Check className="size-[22px] text-white" strokeWidth={2.4} aria-hidden />
      </span>
    ),
    portal: (
      <span className="flex size-10 items-center justify-center rounded-btn bg-brand text-lg font-extrabold text-white">
        {initial}
      </span>
    ),
  }[variant];

  const nameClass = {
    public: "text-[19px] font-extrabold tracking-[-0.01em] text-ink",
    auth: "text-xl font-extrabold text-white",
    console: "text-lg font-extrabold tracking-[-0.01em] text-white",
    portal: "text-lg font-extrabold tracking-[-0.01em] text-ink",
  }[variant];

  const subtitleClass = variant === "console" ? "text-xs text-night-sub" : "text-xs font-medium text-muted";

  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        "flex min-h-target items-center no-underline",
        variant === "auth" ? "gap-3" : "gap-2.5",
        className
      )}
    >
      <span aria-hidden="true">{mark}</span>
      <span className="flex flex-col leading-tight" aria-hidden="true">
        <span className={nameClass}>{name}</span>
        {subtitle && <span className={subtitleClass}>{subtitle}</span>}
      </span>
    </Link>
  );
}
