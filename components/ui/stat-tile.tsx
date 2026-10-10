import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

export interface StatTileProps {
  label: string;
  value: React.ReactNode;
  /** Line under the value: a delta ("+86 this month") or a hint ("See My schedule"). */
  note?: React.ReactNode;
  noteTone?: "ok" | "warn" | "brand" | "muted";
  /** Makes the whole tile a link. */
  href?: string;
  className?: string;
}

const noteClass = {
  ok: "text-ok",
  warn: "text-warn",
  brand: "text-brand",
  muted: "text-muted",
};

/**
 * A single headline number (KPI tile on dashboards). No chart: the number is the message.
 */
export function StatTile({ label, value, note, noteTone = "ok", href, className }: StatTileProps) {
  const body = (
    <>
      <span className="block text-sm font-semibold text-muted">{label}</span>
      <span className="mt-1 block text-[32px] leading-tight font-extrabold tracking-[-0.02em] text-ink">
        {value}
      </span>
      {note && <span className={cn("mt-1 block text-[13px] font-bold", noteClass[noteTone])}>{note}</span>}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cn("card card-link block p-5", className)}>
        {body}
      </Link>
    );
  }
  return <div className={cn("card p-5", className)}>{body}</div>;
}
