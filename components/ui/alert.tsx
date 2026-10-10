import * as React from "react";
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/cn";

export type AlertTone = "error" | "success" | "info" | "warn";

const icons: Record<AlertTone, React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>> = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
  warn: TriangleAlert,
};

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: AlertTone;
}

/**
 * Inline message. Errors use role="alert" so screen readers announce them immediately;
 * other tones use role="status".
 */
export function Alert({ tone = "info", className, children, ...props }: AlertProps) {
  const Icon = icons[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("alert", `alert-${tone}`, className)}
      {...props}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div>{children}</div>
    </div>
  );
}
