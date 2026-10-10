import * as React from "react";
import { cn } from "@/lib/cn";

/**
 * Status colour for a meter fill. These are status colours, not a categorical palette:
 * red and amber are close for colour-blind readers, so a meter always prints its value
 * and, when a tone carries meaning, a `status` text label. Never rely on colour alone.
 */
export type MeterTone = "brand" | "ok" | "warn" | "bad" | "console" | "teal";

const toneColor: Record<MeterTone, string> = {
  brand: "var(--brand)",
  ok: "var(--ps-ok)",
  warn: "var(--ps-warn)",
  bad: "var(--ps-bad)",
  console: "var(--ps-indigo-700)",
  teal: "var(--ps-teal-400)",
};

export interface MeterProps {
  label: React.ReactNode;
  /** 0-100 */
  value: number;
  /** Text shown on the right; defaults to "{value}%". */
  valueText?: string;
  tone?: MeterTone;
  /** Optional status line under the bar, e.g. "Running low". */
  status?: React.ReactNode;
  statusTone?: Exclude<MeterTone, "brand" | "console" | "teal">;
  size?: "sm" | "md";
  className?: string;
}

/** Labelled progress bar used for section accuracy, topic focus and stock levels. */
export function Meter({
  label,
  value,
  valueText,
  tone = "brand",
  status,
  statusTone,
  size = "md",
  className,
}: MeterProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const text = valueText ?? `${clamped}%`;
  const labelId = React.useId();

  return (
    <div className={className}>
      <div
        className={cn(
          "mb-1 flex justify-between gap-3 font-semibold",
          size === "sm" ? "text-[13px]" : "text-sm"
        )}
      >
        <span id={labelId}>{label}</span>
        <span>{text}</span>
      </div>
      <div
        className="meter-track"
        role="progressbar"
        aria-labelledby={labelId}
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={text}
      >
        <div
          className="meter-fill"
          style={{ width: `${clamped}%`, "--meter-color": toneColor[tone] } as React.CSSProperties}
        />
      </div>
      {status && (
        <p
          className={cn(
            "m-0 mt-1 text-xs font-semibold",
            statusTone === "ok" && "text-ok",
            statusTone === "warn" && "text-warn",
            statusTone === "bad" && "text-bad",
            !statusTone && "text-muted"
          )}
        >
          {status}
        </p>
      )}
    </div>
  );
}
