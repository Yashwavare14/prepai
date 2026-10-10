import * as React from "react";
import { cn } from "@/lib/cn";

export type ChipTone = "ok" | "warn" | "bad" | "info" | "mute" | "amber";

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: ChipTone;
}

/**
 * Status and tag pill (.chip .ok/.warn/.bad/.info/.mute).
 * The text is the meaning; colour only reinforces it.
 */
export function Chip({ tone = "info", className, ...props }: ChipProps) {
  return <span className={cn("chip", `chip-${tone}`, className)} {...props} />;
}
