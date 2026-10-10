import Link from "next/link";
import { Show } from "@clerk/nextjs";
import { Menu } from "lucide-react";
import { ButtonLink, Logo } from "@/components/ui";

const NAV = [
  { href: "#exams", label: "Exams" },
  { href: "#how", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#institutes", label: "For institutes" },
  { href: "#faq", label: "FAQ" },
];

/**
 * Landing header (design: index.html). Wide screens show the section links inline.
 * Below 1024px they move into a "Menu" disclosure so the header stays one row
 * (the export wrapped it into three rows on phones).
 */
export function PublicHeader() {
  const actions = (
    <>
      <Show when="signed-out">
        <ButtonLink href="/sign-in" variant="outline" size="xl-sm">
          Sign in
        </ButtonLink>
        <ButtonLink href="/sign-up" variant="primary" size="xl-sm">
          Start free
        </ButtonLink>
      </Show>
      <Show when="signed-in">
        <ButtonLink href="/post-auth" variant="primary" size="xl-sm">
          Go to my dashboard
        </ButtonLink>
      </Show>
    </>
  );

  return (
    <header className="relative border-b border-line bg-surface">
      <div className="mx-auto flex max-w-public items-center gap-x-5 gap-y-2 px-4 py-2.5 sm:px-6">
        <Logo variant="public" href="/" label="Pariksha Studio home" />

        <nav aria-label="Main" className="hidden flex-1 flex-wrap gap-0.5 lg:flex">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className="nav-public-link">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto hidden gap-2.5 sm:flex">{actions}</div>

        {/* Compact menu below 1024px */}
        <details className="group relative ml-auto lg:hidden sm:ml-0">
          <summary
            className="btn btn-outline btn-sm list-none [&::-webkit-details-marker]:hidden"
            aria-label="Open menu"
          >
            <Menu className="size-5" aria-hidden />
            <span>Menu</span>
          </summary>
          <div className="absolute right-0 z-30 mt-2 w-64 rounded-card border border-line bg-surface p-2 shadow-card-hover">
            <nav aria-label="Main" className="flex flex-col">
              {NAV.map((item) => (
                <a key={item.href} href={item.href} className="nav-public-link">
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="mt-2 flex flex-col gap-2 border-t border-divider pt-3 sm:hidden">{actions}</div>
          </div>
        </details>
      </div>
    </header>
  );
}

export function PublicFooter() {
  const linkClass = "inline-flex min-h-target items-center text-indigo-200 underline hover:text-white";
  return (
    <footer className="bg-night-deep text-indigo-200">
      <div className="mx-auto flex max-w-public flex-wrap justify-between gap-8 px-4 py-10 sm:px-6">
        <div className="flex-[1_1_280px]">
          <div className="mb-2 text-lg font-extrabold text-white">Pariksha Studio</div>
          <p className="m-0 max-w-[320px] leading-relaxed">
            Free SSC CGL, Banking and Railways mock tests with instant analysis.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-10">
          <ul className="m-0 grid list-none gap-1 p-0">
            <li className="mb-1 font-extrabold text-white">Students</li>
            <li>
              <Link href="/sign-up" className={linkClass}>
                Create free account
              </Link>
            </li>
            <li>
              <Link href="/sign-in" className={linkClass}>
                Sign in
              </Link>
            </li>
            <li>
              <a href="#pricing" className={linkClass}>
                Pricing
              </a>
            </li>
          </ul>
          <ul className="m-0 grid list-none gap-1 p-0">
            <li className="mb-1 font-extrabold text-white">Institutes</li>
            <li>
              <a href="#institutes" className={linkClass}>
                For institutes
              </a>
            </li>
            <li>
              <Link href="/sign-in" className={linkClass}>
                Institute sign in
              </Link>
            </li>
            <li>
              <a href="#faq" className={linkClass}>
                FAQ
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
