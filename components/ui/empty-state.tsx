import * as React from "react";
import { cn } from "@/lib/cn";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

/** Shown instead of zeros or placeholder numbers when there is no data yet. */
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center gap-2 px-4 py-8 text-center", className)}>
      {icon && (
        <div className="icon-tile mb-1 bg-brand-soft text-brand" aria-hidden="true">
          {icon}
        </div>
      )}
      <p className="m-0 text-base font-bold text-ink">{title}</p>
      {description && <p className="m-0 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
