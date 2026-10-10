import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

type CardSize = "md" | "lg";

const sizeClass: Record<CardSize, string> = {
  md: "",
  lg: "card-lg",
};

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  /** md: 18px radius, 24px padding (portal, console). lg: 20px radius, 28px padding (landing, auth). */
  size?: CardSize;
  as?: "div" | "section" | "article" | "li";
}

/** White panel with a 1px border (.card). */
export function Card({ size = "md", as: Tag = "div", className, ...props }: CardProps) {
  return <Tag className={cn("card", sizeClass[size], className)} {...props} />;
}

export interface LinkCardProps extends Omit<React.ComponentProps<typeof Link>, "className"> {
  size?: CardSize;
  className?: string;
}

/** A whole-card link that lifts on hover (a.card:hover). */
export function LinkCard({ size = "md", className, ...props }: LinkCardProps) {
  return <Link className={cn("card card-link", sizeClass[size], className)} {...props} />;
}
