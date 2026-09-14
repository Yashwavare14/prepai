'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

const POPULAR_EXAMS = [
  'SSC CGL',
  'SSC CHSL',
  'RRB NTPC',
  'RRB Group D',
  'IBPS PO',
  'IBPS Clerk',
  'SBI PO',
  'UPSC CSE',
  'State PSC',
  'CDS',
  'NDA',
];

const STREAMS_12TH = [
  'Science (PCM - Physics, Chemistry, Math)',
  'Science (PCB - Physics, Chemistry, Biology)',
  'Science (PCMB - Math & Biology)',
  'Commerce with Math',
  'Commerce without Math',
  'Arts / Humanities',
  'Vocational / Other',
];

const BOARDS = ['CBSE', 'ICSE / ISC', 'State Board', 'NIOS', 'Other'];

export default function StudentOnboardingPage() {
  const router = useRouter();
  const { user, isLoaded: isUserLoaded } = useUser();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Personal
    name: '',
    email: '',
    phone: '',
    // Step 2: Competitive Goals
    targetExams: [],
    targetYear: '2025',
    preferredLanguage: 'en',
    dailyGoalQuestions: 20,
    // Step 3: Schooling (10th & 12th)
    tenthPercentage: '',
    tenthSchool: '',
    tenthBoard: 'CBSE',
    tenthPassingYear: '',
    twelfthPercentage: '',
    twelfthSchool: '',
    twelfthBoard: 'CBSE',
    twelfthStream: 'Science (PCM - Physics, Chemistry, Math)',
    twelfthPassingYear: '',
    // Step 4: Graduation
    graduationStatus: 'completed', // 'completed' | 'pursuing' | 'not_applicable'
    graduationDegree: '',
    graduationCollege: '',
    graduationScore: '',
    graduationPassingYear: '',
  });

  const [customExamInput, setCustomExamInput] = useState('');

  // Prepopulate from existing profile or Clerk
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/student/profile');
        if (res.ok) {
          const data = await res.json();
          if (data.student) {
            setFormData((prev) => ({
              ...prev,
              ...data.student,
              name: data.student.name || (user?.fullName || ''),
              email: data.student.email || (user?.primaryEmailAddress?.emailAddress || ''),
              targetExams: Array.isArray(data.student.targetExams) ? data.student.targetExams : [],
            }));
          }
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (isUserLoaded) {
      loadProfile();
    }
  }, [isUserLoaded, user]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleTargetExam = (exam) => {
    setFormData((prev) => {
      const exists = prev.targetExams.includes(exam);
      if (exists) {
        return { ...prev, targetExams: prev.targetExams.filter((e) => e !== exam) };
      } else {
        return { ...prev, targetExams: [...prev.targetExams, exam] };
      }
    });
  };

  const handleAddCustomExam = (e) => {
    e.preventDefault();
    const trimmed = customExamInput.trim();
    if (trimmed && !formData.targetExams.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        targetExams: [...prev.targetExams, trimmed],
      }));
      setCustomExamInput('');
    }
  };

  const validateStep = (step) => {
    setError(null);
    if (step === 1) {
      if (!formData.name.trim()) {
        setError('Please enter your full name.');
        return false;
      }
    }
    if (step === 2) {
      if (formData.targetExams.length === 0) {
        setError('Please select at least one target competitive exam.');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/student/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save profile');
      }

      // Redirect to student dashboard
      router.push('/student/dashboard');
    } catch (err) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  const stepTitles = [
    'Basic Details',
    'Target Exams',
    '10th & 12th',
    'Graduation',
    'Review & Finish',
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-medium text-slate-600">Loading student profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
            🎓 Student Setup Wizard
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Build Your PrepAI Profile
          </h1>
          <p className="text-sm text-slate-500">
            Tell us about your background and target exams so we can personalize your mock drills.
          </p>
        </div>

        {/* Stepper Header */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Step {currentStep} of 5: {stepTitles[currentStep - 1]}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {Math.round((currentStep / 5) * 100)}% Complete
            </span>
          </div>

          {/* Progress Track */}
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300 ease-out rounded-full"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>

          {/* Stepper Dots */}
          <div className="flex justify-between items-center mt-3 text-xs">
            {stepTitles.map((title, idx) => {
              const stepNum = idx + 1;
              const isPast = stepNum < currentStep;
              const isCurrent = stepNum === currentStep;

              return (
                <button
                  key={title}
                  type="button"
                  onClick={() => {
                    if (stepNum < currentStep) setCurrentStep(stepNum);
                  }}
                  className={`flex flex-col items-center gap-1 transition-colors ${
                    isPast
                      ? 'text-blue-600 cursor-pointer font-medium'
                      : isCurrent
                      ? 'text-slate-900 font-bold'
                      : 'text-slate-400 cursor-default'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      isPast
                        ? 'bg-blue-600 text-white'
                        : isCurrent
                        ? 'border-2 border-blue-600 text-blue-600 bg-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isPast ? '✓' : stepNum}
                  </span>
                  <span className="hidden sm:inline text-[11px]">{title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Card Form Body */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
          {/* STEP 1: Personal Info */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Personal Information</h2>
                <p className="text-xs text-slate-500 mt-0.5">Let’s get your basic details verified.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 text-sm cursor-not-allowed"
                />
                <p className="text-[11px] text-slate-400 mt-1">Managed automatically via Clerk authentication</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Mobile Number <span className="text-xs font-normal text-slate-400">(Optional)</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="e.g. +91 9876543210"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Competitive Goals */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Exam Ambitions &amp; Goals</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pick the exams you are preparing for so we can tailor test papers and drills.
                </p>
              </div>

              {/* Target Exams Multi-Select Chips */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Target Competitive Exams <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_EXAMS.map((exam) => {
                    const isSelected = formData.targetExams.includes(exam);
                    return (
                      <button
                        type="button"
                        key={exam}
                        onClick={() => toggleTargetExam(exam)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected ? `✓ ${exam}` : `+ ${exam}`}
                      </button>
                    );
                  })}
                </div>

                {/* Add Custom Exam */}
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={customExamInput}
                    onChange={(e) => setCustomExamInput(e.target.value)}
                    placeholder="Other exam (e.g. AFCAT, Bank Clerk)..."
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomExam}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Target Year</label>
                  <select
                    value={formData.targetYear || '2025'}
                    onChange={(e) => handleChange('targetYear', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Preferred Language</label>
                  <select
                    value={formData.preferredLanguage || 'en'}
                    onChange={(e) => handleChange('preferredLanguage', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi (हिंदी)</option>
                  </select>
                </div>
              </div>

              {/* Daily Question Goal Slider */}
              <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-slate-900">Daily Question Practice Goal</label>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-bold text-xs">
                    {formData.dailyGoalQuestions} questions / day
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={formData.dailyGoalQuestions}
                  onChange={(e) => handleChange('dailyGoalQuestions', Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                  <span>5 (Casual)</span>
                  <span>20 (Recommended)</span>
                  <span>50 (Intensive)</span>
                  <span>100 (Hardcore)</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Schooling (10th & 12th) */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Secondary &amp; Senior Secondary</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Used for checking eligibility against government recruitment notifications.
                </p>
              </div>

              {/* 10th Standard */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  1. 10th Standard (Matriculation)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Board</label>
                    <select
                      value={formData.tenthBoard || 'CBSE'}
                      onChange={(e) => handleChange('tenthBoard', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {BOARDS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Percentage / CGPA</label>
                    <input
                      type="text"
                      placeholder="e.g. 88.4%"
                      value={formData.tenthPercentage || ''}
                      onChange={(e) => handleChange('tenthPercentage', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Passing Year</label>
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="e.g. 2019"
                      value={formData.tenthPassingYear || ''}
                      onChange={(e) => handleChange('tenthPassingYear', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">School Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Kendriya Vidyalaya No. 1"
                    value={formData.tenthSchool || ''}
                    onChange={(e) => handleChange('tenthSchool', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* 12th Standard */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  2. 12th Standard (Higher Secondary)
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Stream / Discipline</label>
                  <select
                    value={formData.twelfthStream || STREAMS_12TH[0]}
                    onChange={(e) => handleChange('twelfthStream', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {STREAMS_12TH.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Board</label>
                    <select
                      value={formData.twelfthBoard || 'CBSE'}
                      onChange={(e) => handleChange('twelfthBoard', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {BOARDS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Percentage / CGPA</label>
                    <input
                      type="text"
                      placeholder="e.g. 85.0%"
                      value={formData.twelfthPercentage || ''}
                      onChange={(e) => handleChange('twelfthPercentage', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Passing Year</label>
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="e.g. 2021"
                      value={formData.twelfthPassingYear || ''}
                      onChange={(e) => handleChange('twelfthPassingYear', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">School / Junior College Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Delhi Public School"
                    value={formData.twelfthSchool || ''}
                    onChange={(e) => handleChange('twelfthSchool', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Graduation */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Graduation / Higher Education</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Graduate-level exams like SSC CGL and IBPS PO require degree verification.
                </p>
              </div>

              {/* Status Radio options */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Graduation Status</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'completed', label: 'Completed Degree' },
                    { value: 'pursuing', label: 'Currently Pursuing' },
                    { value: 'not_applicable', label: 'Not Applicable' },
                  ].map((st) => {
                    const isSelected = formData.graduationStatus === st.value;
                    return (
                      <button
                        type="button"
                        key={st.value}
                        onClick={() => handleChange('graduationStatus', st.value)}
                        className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {st.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {formData.graduationStatus !== 'not_applicable' && (
                <div className="space-y-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Degree Name</label>
                      <input
                        type="text"
                        placeholder="e.g. B.Tech Computer Science, B.Com, B.A."
                        value={formData.graduationDegree || ''}
                        onChange={(e) => handleChange('graduationDegree', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">College / University</label>
                      <input
                        type="text"
                        placeholder="e.g. Delhi University, IIT Bombay, Anna University"
                        value={formData.graduationCollege || ''}
                        onChange={(e) => handleChange('graduationCollege', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Score / CGPA / Percentage
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 8.2 CGPA or 76%"
                        value={formData.graduationScore || ''}
                        onChange={(e) => handleChange('graduationScore', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Passing / Expected Year
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="e.g. 2024"
                        value={formData.graduationPassingYear || ''}
                        onChange={(e) => handleChange('graduationPassingYear', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Review & Submit */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Review Your Profile</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Confirm your details below. You can always modify them later from your profile settings.
                </p>
              </div>

              {/* Review Sections */}
              <div className="space-y-4">
                {/* 1. Profile & Exam Goals */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold uppercase text-slate-600">Target Exams &amp; Details</span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-xs text-blue-600 hover:underline font-semibold"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-sm font-bold text-slate-900">{formData.name}</p>
                  <p className="text-xs text-slate-500">{formData.email}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {formData.targetExams.map((e) => (
                      <span key={e} className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
                        {e}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-slate-600 flex gap-4">
                    <span>Year: <strong>{formData.targetYear}</strong></span>
                    <span>Daily Goal: <strong>{formData.dailyGoalQuestions} Qs</strong></span>
                    <span>Language: <strong>{formData.preferredLanguage === 'hi' ? 'Hindi' : 'English'}</strong></span>
                  </div>
                </div>

                {/* 2. Academic History */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold uppercase text-slate-600">Academic Background</span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="text-xs text-blue-600 hover:underline font-semibold"
                    >
                      Edit
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="font-bold block text-slate-900 mb-1">10th Standard</span>
                      <p>Board: {formData.tenthBoard || 'Not specified'}</p>
                      <p>Score: {formData.tenthPercentage || 'Not specified'}</p>
                      <p>Year: {formData.tenthPassingYear || 'Not specified'}</p>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="font-bold block text-slate-900 mb-1">12th Standard</span>
                      <p>Stream: {formData.twelfthStream || 'Not specified'}</p>
                      <p>Score: {formData.twelfthPercentage || 'Not specified'}</p>
                      <p>Year: {formData.twelfthPassingYear || 'Not specified'}</p>
                    </div>
                  </div>

                  {formData.graduationStatus !== 'not_applicable' && (
                    <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-700">
                      <span className="font-bold block text-slate-900 mb-1">Higher Education ({formData.graduationStatus})</span>
                      <p>Degree: {formData.graduationDegree || 'Not specified'}</p>
                      <p>College: {formData.graduationCollege || 'Not specified'}</p>
                      <p>Score: {formData.graduationScore || 'Not specified'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ← Back
              </button>
            ) : (
              <div />
            )}

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                Next Step →
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="px-8 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-sm font-bold text-white shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Saving Profile...' : 'Complete Profile & Launch Dashboard 🎉'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
