'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

export default function StudentDashboardPage() {
  const { user } = useUser();
  const [student, setStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/student/profile');
        if (res.ok) {
          const data = await res.json();
          setStudent(data.student);
        }
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6 flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-medium text-slate-600">Loading your learning dashboard...</p>
        </div>
      </div>
    );
  }

  const displayName = student?.name || user?.fullName || 'Exam Aspirant';
  const targetExams = Array.isArray(student?.targetExams) ? student.targetExams : [];
  const dailyGoal = student?.dailyGoalQuestions || 20;
  const streak = student?.currentStreakDays || 0;
  const xp = student?.xpPoints || 0;
  const totalAttempted = student?.totalAttempted || 0;
  const totalCorrect = student?.totalCorrect || 0;
  const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
  const isOnboardingDone = student?.onboardingCompleted;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Onboarding Notice Banner (if not completed) */}
      {!isOnboardingDone && (
        <div className="p-4 sm:p-5 rounded-2xl bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Complete your Academic Profile</h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Add your 10th, 12th stream, and target exams to unlock personalized practice sets.
              </p>
            </div>
          </div>
          <Link
            href="/student/onboarding"
            className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs transition-colors shadow-xs"
          >
            Finish Setup Wizard →
          </Link>
        </div>
      )}

      {/* Hero Welcome Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-linear-to-r from-blue-700 via-indigo-700 to-slate-900 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-blue-200 text-xs font-semibold border border-white/10">
            <span>🎯 Target Year: {student?.targetYear || '2025'}</span>
            <span>•</span>
            <span>{student?.preferredLanguage === 'hi' ? 'Hindi Medium' : 'English Medium'}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Welcome back, <span className="text-blue-300">{displayName}</span>! 👋
          </h1>

          <p className="text-sm text-blue-100/90 leading-relaxed">
            Ready to test your knowledge today? Solve daily drills, practice past year questions, and level up your accuracy.
          </p>

          {targetExams.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-blue-200 font-medium">Your Targets:</span>
              {targetExams.map((exam) => (
                <span
                  key={exam}
                  className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-white text-xs font-semibold"
                >
                  {exam}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Link
            href="/student/onboarding"
            className="px-5 py-3 rounded-xl font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs text-center transition-all"
          >
            ⚙️ Edit Profile &amp; Goals
          </Link>
          <Link
            href="/admin/questions"
            className="px-6 py-3 rounded-xl font-bold bg-blue-500 hover:bg-blue-400 text-white text-xs text-center shadow-md shadow-blue-950/30 transition-all"
          >
            🚀 Browse Questions Bank
          </Link>
        </div>
      </div>

      {/* 4 Core Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Daily Goal */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Daily Goal</span>
            <span className="text-blue-600 font-bold">{dailyGoal} Qs Target</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">0</span>
            <span className="text-slate-400 text-sm font-medium">/ {dailyGoal} completed</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full" style={{ width: '0%' }}></div>
          </div>
        </div>

        {/* Study Streak */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Study Streak</span>
            <span className="text-orange-600 font-bold">🔥 Active</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{streak}</span>
            <span className="text-slate-400 text-sm font-medium">days in a row</span>
          </div>
          <p className="text-xs text-slate-500">
            Personal best: <strong className="text-slate-700">{student?.longestStreakDays || 0} days</strong>
          </p>
        </div>

        {/* XP Points */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>XP Points</span>
            <span className="text-amber-600 font-bold">⭐ Level 1</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{xp}</span>
            <span className="text-slate-400 text-sm font-medium">XP earned</span>
          </div>
          <p className="text-xs text-slate-500">+10 XP per correct question solved</p>
        </div>

        {/* Overall Accuracy */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Accuracy Rate</span>
            <span className="text-emerald-600 font-bold">🎯 Precision</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{accuracy}%</span>
            <span className="text-slate-400 text-sm font-medium">
              ({totalCorrect}/{totalAttempted})
            </span>
          </div>
          <p className="text-xs text-slate-500">Calculated over all answered questions</p>
        </div>
      </div>

      {/* Main Content: Practice Drills & Academic Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Subject Practice Drills */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Topic-Wise Practice Drills</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Handpicked past year questions categorized by topic.
              </p>
            </div>
            <Link
              href="/admin/questions"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              View Full Bank →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                title: 'Quantitative Aptitude',
                desc: 'Algebra, Geometry, Arithmetic, Trigonometry, Number System',
                color: 'blue',
                icon: '📐',
              },
              {
                title: 'Reasoning & Intelligence',
                desc: 'Analogy, Coding-Decoding, Syllogism, Blood Relations, Puzzles',
                color: 'indigo',
                icon: '🧩',
              },
              {
                title: 'General Awareness (GK)',
                desc: 'History, Polity, Geography, Current Affairs, Science',
                color: 'emerald',
                icon: '🌍',
              },
              {
                title: 'English Comprehension',
                desc: 'Grammar rules, Vocabulary, Idioms, Reading passages',
                color: 'violet',
                icon: '📖',
              },
            ].map((subject) => (
              <div
                key={subject.title}
                className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">
                    {subject.icon}
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{subject.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{subject.desc}</p>
                </div>
                <div className="mt-5 pt-3 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-400">Exam Ready</span>
                  <Link
                    href={`/admin/questions?topic=${encodeURIComponent(
                      subject.title.includes('Quants') ? 'Quants' : subject.title.includes('Reasoning') ? 'Reasoning' : subject.title.includes('GK') ? 'GK' : 'English'
                    )}`}
                    className="text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform"
                  >
                    Start Practice →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Academic Credentials Snapshot */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Your Credentials</h2>
            <Link
              href="/student/onboarding"
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Edit
            </Link>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-5">
            {/* 10th */}
            <div className="pb-4 border-b border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Secondary (10th)
              </span>
              <div className="mt-1 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-800">
                  {student?.tenthPercentage ? `${student.tenthPercentage}` : 'Not added'}
                </span>
                <span className="text-xs text-slate-500">{student?.tenthBoard || 'Board pending'}</span>
              </div>
              {student?.tenthSchool && (
                <p className="text-xs text-slate-500 mt-0.5 truncate">{student.tenthSchool}</p>
              )}
            </div>

            {/* 12th */}
            <div className="pb-4 border-b border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Higher Secondary (12th)
              </span>
              <div className="mt-1 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-800">
                  {student?.twelfthPercentage ? `${student.twelfthPercentage}` : 'Not added'}
                </span>
                <span className="text-xs text-slate-500">{student?.twelfthBoard || 'Board pending'}</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">
                {student?.twelfthStream || 'Stream not specified'}
              </p>
            </div>

            {/* Graduation */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Higher Education ({student?.graduationStatus || 'Pending'})
              </span>
              {student?.graduationDegree ? (
                <div className="mt-1 space-y-0.5">
                  <span className="text-sm font-bold text-slate-800 block">
                    {student.graduationDegree}
                  </span>
                  <p className="text-xs text-slate-500">{student.graduationCollege}</p>
                  {student.graduationScore && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-semibold">
                      Score: {student.graduationScore}
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-400 mt-1 italic">No degree added yet</p>
              )}
            </div>

            <div className="pt-2">
              <Link
                href="/student/onboarding"
                className="block w-full py-2.5 rounded-xl border border-slate-200 text-center text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Update Academic Details ✏️
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
