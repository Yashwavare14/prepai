"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

export interface PillTabOption<T extends string> {
  value: T;
  label: React.ReactNode;
}

export interface PillTabsProps<T extends string> {
  options: PillTabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Accessible name for the group, e.g. "Filter exams by type". */
  label: string;
  className?: string;
}

/** Filter toggles (.tab[aria-pressed]): All, Full mock, Sectional, Topic test... */
export function PillTabs<T extends string>({ options, value, onChange, label, className }: PillTabsProps<T>) {
  return (
    <div role="group" aria-label={label} className={cn("flex flex-wrap gap-2", className)}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className="pill-tab"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
