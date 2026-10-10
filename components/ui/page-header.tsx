import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

export interface Crumb {
  label: string;
  href?: string;
}

/** "Dashboard / Exams / SSC CGL Full Mock 15" trail used on console pages. */
export function Breadcrumb({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("text-sm text-muted", className)}>
      <ol className="m-0 flex list-none flex-wrap items-center gap-1 p-0">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1">
              {item.href && !isLast ? (
                <Link href={item.href} className="underline">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined}>{item.label}</span>
              )}
              {!isLast && <span aria-hidden="true">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  breadcrumb?: Crumb[];
  /** Buttons aligned to the right on wide screens. */
  actions?: React.ReactNode;
  className?: string;
}

/** Page title block for portal and console pages. */
export function PageHeader({ title, description, breadcrumb, actions, className }: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-2", className)}>
      {breadcrumb && <Breadcrumb items={breadcrumb} />}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-[640px]">
          <h1 className="m-0 text-h1">{title}</h1>
          {description && <p className="m-0 mt-1 text-base text-muted">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
      </div>
    </header>
  );
}
