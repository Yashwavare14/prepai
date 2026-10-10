import * as React from "react";
import { cn } from "@/lib/cn";

type FieldSize = "md" | "lg";

/* ------------------------------------------------------------------ */
/* Controls                                                            */
/* ------------------------------------------------------------------ */

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** md: 44px (portal, console). lg: 48px with 16px text (auth pages). */
  size?: FieldSize;
  ref?: React.Ref<HTMLInputElement>;
}

/** Text input with the design's 2px border (.in). */
export function Input({ size = "md", className, ...props }: InputProps) {
  return <input className={cn("field-input", size === "lg" && "field-input-lg", className)} {...props} />;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  size?: FieldSize;
  ref?: React.Ref<HTMLSelectElement>;
}

/** Native select, styled like inputs. Native keeps keyboard and screen-reader behaviour. */
export function Select({ size = "md", className, ...props }: SelectProps) {
  return <select className={cn("field-input", size === "lg" && "field-input-lg", className)} {...props} />;
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  ref?: React.Ref<HTMLTextAreaElement>;
}

export function Textarea({ className, ...props }: TextareaProps) {
  return <textarea className={cn("field-input", className)} {...props} />;
}

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: React.ReactNode;
  /** Align the box to the first line of a multi-line label. */
  alignTop?: boolean;
  ref?: React.Ref<HTMLInputElement>;
}

/** 22px checkbox inside a 44px-tall clickable row. */
export function Checkbox({ label, alignTop = false, className, ...props }: CheckboxProps) {
  return (
    <label className={cn("check-row", alignTop && "check-row-top", className)}>
      <input type="checkbox" className="check-box" {...props} />
      <span>{label}</span>
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* Field wrapper: label + control + hint + error, wired with ARIA      */
/* ------------------------------------------------------------------ */

export interface FieldProps {
  /** id of the control inside; also used to derive hint and error ids. */
  id: string;
  label: React.ReactNode;
  /** Renders "(optional)" after the label. */
  optional?: boolean;
  hint?: React.ReactNode;
  error?: string | null;
  className?: string;
  children: React.ReactElement<{
    id?: string;
    "aria-describedby"?: string;
    "aria-invalid"?: boolean | "true" | "false";
  }>;
}

export function Field({ id, label, optional, hint, error, className, children }: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  const control = React.cloneElement(children, {
    id,
    "aria-describedby": describedBy,
    "aria-invalid": error ? true : undefined,
  });

  return (
    <div className={cn("field", className)}>
      <label htmlFor={id} className="field-label">
        {label}
        {optional && <span className="field-label-optional"> (optional)</span>}
      </label>
      {control}
      {hint && (
        <p id={hintId} className="field-hint m-0">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="field-error m-0">
          {error}
        </p>
      )}
    </div>
  );
}
