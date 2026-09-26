'use client';

import { CreateOrganization } from '@clerk/nextjs';
import Link from 'next/link';

export default function CreateInstitutePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-xl space-y-6">
        <div className="text-center space-y-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Register Tuition / Coaching Center
          </h1>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Create an isolated environment for your coaching classes, invite your faculty and students, and manage your custom test series.
          </p>
        </div>

        <div className="flex justify-center bg-white p-6 rounded-2xl shadow-xl border border-slate-200">
          <CreateOrganization
            afterCreateOrganizationUrl="/institute/dashboard"
          />
        </div>
      </div>
    </div>
  );
}
