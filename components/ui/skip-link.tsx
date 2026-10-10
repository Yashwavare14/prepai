export interface SkipLinkProps {
  href?: string;
  children?: React.ReactNode;
}

/** First focusable element on every page; jumps keyboard users past the header. */
export function SkipLink({ href = "#main", children = "Skip to main content" }: SkipLinkProps) {
  return (
    <a className="skip-link" href={href}>
      {children}
    </a>
  );
}
