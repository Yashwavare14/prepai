'use client';

import { useOrganization, useUser, OrganizationProfile, OrganizationSwitcher } from '@clerk/nextjs';
import Link from 'next/link';

export default function InstituteDashboardPage() {
  const { organization, isLoaded: orgLoaded, membership } = useOrganization();
  const { user, isLoaded: userLoaded } = useUser();

  if (!orgLoaded || !userLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="flex items-center gap-3 text-slate-600 font-medium">
          <span className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          Loading Coaching Workspace...
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-200 space-y-5">
          <div className="text-4xl">🏫</div>
          <h2 className="text-2xl font-bold text-slate-900">No Coaching Workspace Selected</h2>
          <p className="text-sm text-slate-600">
            You are not currently in an active tuition or coaching center workspace.
          </p>
          <div className="pt-2 flex flex-col gap-3">
            <Link
              href="/institute/create"
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition text-sm"
            >
              + Register New Tuition / Coaching Class
            </Link>
            <div className="pt-2 flex items-center justify-center">
              <OrganizationSwitcher />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const roleName = membership?.role === 'org:admin' ? 'Coaching Faculty / Administrator' : 'Enrolled Student';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-extrabold text-base shadow-sm">
                P
              </span>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">PrepAI</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
              {organization.name}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <OrganizationSwitcher
              afterCreateOrganizationUrl="/institute/dashboard"
              afterLeaveOrganizationUrl="/institute/dashboard"
              afterSelectOrganizationUrl="/institute/dashboard"
            />
            <Link
              href="/student/dashboard"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Student Portal →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 flex-1">
        {/* Welcome Header */}
        <div className="bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/20">
              <span>🏫 Coaching Center Workspace</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">{organization.name}</h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Manage your batch tests, upload custom exam papers for your students, and monitor coaching performance analytics.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 text-right space-y-1">
            <div className="text-xs text-slate-300">Signed in as</div>
            <div className="font-bold text-sm text-white">{user?.fullName || user?.primaryEmailAddress?.emailAddress}</div>
            <div className="text-xs text-emerald-400 font-semibold">{roleName}</div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Upload Custom PDF */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-2xl font-bold">
              📄
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Upload Institute Test PDF</h3>
              <p className="text-xs text-slate-500 mt-1">
                Extract questions from your institute test papers and assign them directly to your batches.
              </p>
            </div>
            <Link
              href="/admin/upload-pdf"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Open PDF Ingestion →
            </Link>
          </div>

          {/* Card 2: Question Bank */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-2xl font-bold">
              📚
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Institute Question Bank</h3>
              <p className="text-xs text-slate-500 mt-1">
                Browse questions categorized by subject, review AI-generated questions, and approve test items.
              </p>
            </div>
            <Link
              href="/admin/questions"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Manage Questions →
            </Link>
          </div>

          {/* Card 3: Batch Mock Tests */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-2xl font-bold">
              ⏱️
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Batch Mock Tests</h3>
              <p className="text-xs text-slate-500 mt-1">
                Assemble custom mock tests and timed exam simulations for your enrolled students.
              </p>
            </div>
            <Link
              href="/test"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
            >
              Test Simulation →
            </Link>
          </div>
        </div>

        {/* Member Management & Invitations via Clerk */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Faculty &amp; Student Members</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Invite faculty teachers as Admins and students as Members into this coaching workspace.
              </p>
            </div>
          </div>

          <div className="py-2">
            <OrganizationProfile />
          </div>
        </div>
      </main>
    </div>
  );
}
