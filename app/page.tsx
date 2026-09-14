import Link from "next/link";
import { Show, UserButton } from "@clerk/nextjs";


export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 via-white to-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="w-full border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-lg shadow-md shadow-blue-500/20">
              P
            </span>
            <span className="font-extrabold text-xl text-slate-900 tracking-tight">PrepAI</span>
          </div>

          <div className="flex items-center gap-3">
            <Show when="signed-out">
              <Link
                href="/sign-in"
                className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
              >
                Sign Up
              </Link>
            </Show>



            <Show when="signed-in">
              <Link
                href="/student/dashboard"
                className="px-3.5 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors mr-2"
              >
                Student Dashboard →
              </Link>
              <Link
                href="/admin/upload-pdf"
                className="px-3.5 py-2 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors mr-2"
              >
                Admin Portal
              </Link>
              <UserButton />
            </Show>
          </div>
        </div>
      </header>



      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-20 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-6">
          <span>🚀 Powered by AI Exam Parsing &amp; Clerk Auth</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-3xl">
          Master Your Competitive Exams with <span className="text-blue-600">PrepAI</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl leading-relaxed">
          Smart question extraction, structured metadata, and AI-driven practice for SSC CGL, RRB, IBPS, UPSC, and more.
        </p>

        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <Link
            href="/admin/upload-pdf"
            className="px-6 py-3.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 transition-all text-base"
          >
            Go to Admin PDF Parser
          </Link>
          <Link
            href="/admin/questions"
            className="px-6 py-3.5 rounded-xl font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 shadow-xs transition-all text-base"
          >
            Explore Question Bank
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left w-full">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-2xl mb-3">⚡</div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Live PDF Parsing</h2>
            <p className="text-sm text-slate-600">
              Extract questions, options, answers, and explanations directly from past exam PDFs.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-2xl mb-3">🔒</div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Clerk Protected</h2>
            <p className="text-sm text-slate-600">
              Secure authentication with modern session management and role-ready middleware.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-2xl mb-3">🎯</div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Categorized Bank</h2>
            <p className="text-sm text-slate-600">
              Filter questions by exam, topic, and year with individual or batch approval workflows.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

