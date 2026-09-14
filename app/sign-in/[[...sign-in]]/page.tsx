import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900">PrepAI Admin &amp; Student Portal</h1>
        <p className="text-sm text-slate-500 mt-1">Sign in to access exam preparation and admin tools</p>
      </div>
      <SignIn />
    </main>
  );
}
