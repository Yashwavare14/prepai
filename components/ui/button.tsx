import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Button styles from the design export (.btn, .btn-primary, ...).
 * Use <Button> for actions and <ButtonLink> for navigation; both share these variants.
 */
export const buttonVariants = cva("btn", {
  variants: {
    variant: {
      primary: "btn-primary",
      outline: "btn-outline",
      light: "btn-light",
      ghost: "btn-ghost",
      amber: "btn-amber",
      danger: "btn-danger",
      link: "btn-link",
    },
    size: {
      sm: "btn-sm",
      md: "",
      lg: "btn-lg",
      xl: "btn-xl",
      /** Landing header: xl styling at 44px */
      "xl-sm": "btn-xl btn-sm",
    },
    block: {
      true: "btn-block",
      false: "",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
    block: false,
  },
});

type ButtonVariantProps = VariantProps<typeof buttonVariants>;

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariantProps {
  /** Shows a spinner, disables the button and swaps the label. */
  loading?: boolean;
  loadingText?: string;
}

export function Button({
  className,
  variant,
  size,
  block,
  loading = false,
  loadingText,
  disabled,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size, block }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          {loadingText ?? children}
        </>
      ) : (
        children
      )}
    </button>
  );
}

export interface ButtonLinkProps
  extends Omit<React.ComponentProps<typeof Link>, "className">,
    ButtonVariantProps {
  className?: string;
}

export function ButtonLink({ className, variant, size, block, ...props }: ButtonLinkProps) {
  return <Link className={cn(buttonVariants({ variant, size, block }), className)} {...props} />;
}
