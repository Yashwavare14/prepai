'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  const navLinks = [
    { href: '/admin/upload-pdf', label: '📄 Upload PDF' },
    { href: '/admin/questions', label: '📚 Questions Bank' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Admin Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-sm group-hover:bg-blue-700 transition-colors">
                P
              </span>
              <div>
                <span className="font-extrabold text-slate-900 tracking-tight text-lg">PrepAI</span>
                <span className="ml-2 text-xs font-semibold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  Admin
                </span>
              </div>
            </Link>

            <nav className="flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="hidden sm:inline-block text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
            >
              ← Back to App
            </Link>
            <div className="flex items-center border-l border-slate-200 pl-4">
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: 'w-9 h-9 ring-2 ring-blue-500/20',
                  },
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {children}
      </main>
    </div>
  );
}
