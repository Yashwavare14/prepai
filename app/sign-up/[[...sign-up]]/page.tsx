import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Join PrepAI</h1>
        <p className="text-sm text-slate-500 mt-1">Create an account to start practicing and managing questions</p>
      </div>
      <SignUp />
    </main>
  );
}
