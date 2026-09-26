'use client';

import Link from 'next/link';
import { UserButton, useUser, useOrganization } from '@clerk/nextjs';

export default function UnauthorizedPage() {
  const { user } = useUser();
  const { organization } = useOrganization();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 text-center">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-200 space-y-6">
        {/* Lock Icon */}
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner">
          🔒
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Access Restricted</h1>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            You do not have the required permissions to view this area.
          </p>
        </div>

        {/* Current Identity Details */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-left space-y-1.5 text-slate-700">
          <div className="flex justify-between">
            <span className="font-semibold text-slate-500">Signed In As:</span>
            <span className="font-medium truncate max-w-[200px]">
              {user?.primaryEmailAddress?.emailAddress || user?.fullName || 'User'}
            </span>
          </div>
          {organization && (
            <div className="flex justify-between">
              <span className="font-semibold text-slate-500">Active Tuition / Institute:</span>
              <span className="font-medium text-blue-700 truncate max-w-[200px]">
                {organization.name}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 pt-2">
          <Link
            href="/student/dashboard"
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition text-sm flex items-center justify-center gap-2"
          >
            ← Back to Student Dashboard
          </Link>
          <Link
            href="/"
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition text-sm"
          >
            Home Page
          </Link>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-2">
          <span className="text-xs text-slate-400">Need to switch accounts?</span>
          <UserButton />
        </div>
      </div>
    </div>
  );
}
