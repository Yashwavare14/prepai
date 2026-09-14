'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const staticExamOptions = ['SSC CGL', 'RRB', 'IBPS', 'UPSC', 'Bank PO'];
const staticTopicOptions = ['Quants', 'GK', 'Reasoning', 'English', 'General Science'];

const formatError = (error) => {
  if (error instanceof Error) return error.message;
  return String(error ?? 'Unknown error');
};

const fetchQuestions = async ({ queryKey }) => {
  const [, exam, topic, year] = queryKey;
  const params = new URLSearchParams();
  if (exam) params.append('exam', exam);
  if (topic) params.append('topic', topic);
  if (year) params.append('year', year);

  const res = await fetch(`/api/admin/questions?${params}`);
  if (!res.ok) {
    throw new Error('Failed to load questions');
  }
  return res.json();
};

const fetchYears = async () => {
  const res = await fetch('/api/filters/years');
  if (!res.ok) return [];
  return res.json();
};

const fetchExams = async () => {
  const res = await fetch('/api/filters/exams');
  if (!res.ok) {
    throw new Error('Failed to load exams');
  }
  return res.json();
};

const fetchTopics = async ({ queryKey }) => {
  const [, exam] = queryKey;
  const res = await fetch(`/api/filters/topics?exam=${encodeURIComponent(exam)}`);
  if (!res.ok) {
    throw new Error('Failed to load topics');
  }
  return res.json();
};

const generateQuestions = async (payload) => {
  const res = await fetch('/api/admin/generate-questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to generate questions');
  }

  return data;
};

const approveQuestion = async (id) => {
  const res = await fetch(`/api/admin/questions/${id}/approve`, {
    method: 'PATCH',
  });

  if (!res.ok) {
    throw new Error('Failed to approve question');
  }

  return res.json();
};

const deleteQuestion = async (id) => {
  const res = await fetch(`/api/admin/questions/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    throw new Error('Failed to delete question');
  }

  return res.json();
};

export default function AdminQuestionsPage() {
  const [filters, setFilters] = useState({ exam: '', topic: '', year: '', status: 'all' });
  const [generateForm, setGenerateForm] = useState({
    exam: '',
    topic: '',
    difficulty: 'medium',
    count: 10,
  });
  const [generateError, setGenerateError] = useState(null);
  const [generateSuccess, setGenerateSuccess] = useState(null);
  const [approvingId, setApprovingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const queryClient = useQueryClient();

  const examsQuery = useQuery({
    queryKey: ['adminExams'],
    queryFn: fetchExams,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const topicsQuery = useQuery({
    queryKey: ['adminTopics', filters.exam],
    queryFn: fetchTopics,
    enabled: Boolean(filters.exam),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const yearsQuery = useQuery({
    queryKey: ['adminYears'],
    queryFn: fetchYears,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const genTopicsQuery = useQuery({
    queryKey: ['adminGenTopics', generateForm.exam],
    queryFn: fetchTopics,
    enabled: Boolean(generateForm.exam),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const questionsQuery = useQuery({
    queryKey: ['adminQuestions', filters.exam, filters.topic, filters.year],
    queryFn: fetchQuestions,
    keepPreviousData: true,
    retry: 1,
  });

  const generateMutation = useMutation({
    mutationFn: generateQuestions,
    onSuccess: (data) => {
      setGenerateSuccess(`✅ Generated ${data.generatedCount} questions and saved them as pending review.`);
      setGenerateError(null);
      setGenerateForm((prev) => ({ ...prev, count: 10 }));
      queryClient.invalidateQueries({ queryKey: ['adminQuestions'] });
    },
    onError: (error) => {
      setGenerateError(formatError(error));
      setGenerateSuccess(null);
    },
  });

  const approveMutation = useMutation({
    mutationFn: approveQuestion,
    onSuccess: () => {
      setApprovingId(null);
      queryClient.invalidateQueries({ queryKey: ['adminQuestions'] });
    },
    onError: (err) => {
      alert(`Failed to approve question: ${formatError(err)}`);
      setApprovingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteQuestion,
    onSuccess: () => {
      setDeletingId(null);
      queryClient.invalidateQueries({ queryKey: ['adminQuestions'] });
    },
    onError: (err) => {
      alert(`Failed to delete question: ${formatError(err)}`);
      setDeletingId(null);
    },
  });

  const examOptions = examsQuery.data?.length ? examsQuery.data : staticExamOptions;
  const filterTopicOptions = topicsQuery.data?.length ? topicsQuery.data : staticTopicOptions;
  const genTopicOptions = genTopicsQuery.data?.length ? genTopicsQuery.data : staticTopicOptions;

  const rawQuestions = questionsQuery.data ?? [];
  const questions = rawQuestions.filter((q) => {
    if (filters.status === 'pending') return q.status === 'pending_review';
    if (filters.status === 'approved') return q.status === 'approved';
    return true;
  });

  const isQuestionsLoading = questionsQuery.isLoading;
  const questionsError = questionsQuery.isError ? formatError(questionsQuery.error) : null;
  const isGenerating = generateMutation.isLoading;

  const pendingCount = rawQuestions.filter((q) => q.status === 'pending_review').length;
  const approvedCount = rawQuestions.filter((q) => q.status === 'approved').length;

  const handleGenerateQuestions = async (e) => {
    e.preventDefault();
    setGenerateError(null);
    setGenerateSuccess(null);

    if (!generateForm.exam || !generateForm.topic) {
      setGenerateError('Exam and topic are required to generate questions.');
      return;
    }

    generateMutation.mutate(generateForm);
  };

  const handleApprove = (id) => {
    setApprovingId(id);
    approveMutation.mutate(id);
  };

  const handleDelete = (id) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    setDeletingId(id);
    deleteMutation.mutate(id);
  };

  const handleApproveAllPending = async () => {
    const pendingQuestions = questions.filter((q) => q.status === 'pending_review');
    if (pendingQuestions.length === 0) return;
    if (!confirm(`Are you sure you want to approve all ${pendingQuestions.length} pending questions in this view?`)) return;

    for (const q of pendingQuestions) {
      try {
        await approveQuestion(q.id);
      } catch (err) {
        console.error(`Failed to approve question ${q.id}`, err);
      }
    }
    queryClient.invalidateQueries({ queryKey: ['adminQuestions'] });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manage Questions</h1>
        <p className="text-sm text-gray-500 mt-1">
          Browse question bank, review pending submissions, and generate questions via AI.
        </p>
      </div>

      {/* 1. Generate Questions Card */}
      <div className="p-6 bg-white rounded-lg shadow-lg border border-gray-200 space-y-5">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">1. Generate Questions with AI</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Uses approved reference questions in this exam &amp; topic to synthesize fresh exam-accurate questions.
          </p>
        </div>

        <form onSubmit={handleGenerateQuestions} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-gray-700">Target Exam</label>
              <select
                value={generateForm.exam}
                onChange={(e) => setGenerateForm({ ...generateForm, exam: e.target.value, topic: '' })}
                required
                className="w-full px-4 py-2 bg-white border-2 border-gray-300 rounded text-gray-900 focus:outline-none focus:border-blue-500"
              >
                <option value="">Select Exam</option>
                {examOptions.map((exam) => (
                  <option key={exam} value={exam}>
                    {exam}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5 text-gray-700">Target Topic</label>
              <select
                value={generateForm.topic}
                onChange={(e) => setGenerateForm({ ...generateForm, topic: e.target.value })}
                required
                disabled={!generateForm.exam}
                className="w-full px-4 py-2 bg-white border-2 border-gray-300 rounded text-gray-900 focus:outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Select Topic</option>
                {genTopicOptions.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5 text-gray-700">Difficulty</label>
              <select
                value={generateForm.difficulty}
                onChange={(e) => setGenerateForm({ ...generateForm, difficulty: e.target.value })}
                className="w-full px-4 py-2 bg-white border-2 border-gray-300 rounded text-gray-900 focus:outline-none focus:border-blue-500"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5 text-gray-700">Count (5 - 50)</label>
              <input
                type="number"
                min="5"
                max="50"
                value={generateForm.count}
                onChange={(e) => setGenerateForm({ ...generateForm, count: Number(e.target.value) })}
                className="w-full px-4 py-2 bg-white border-2 border-gray-300 rounded text-gray-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isGenerating || !generateForm.exam || !generateForm.topic}
            className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 text-base"
          >
            {isGenerating ? (
              <>
                <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                Generating Questions with AI...
              </>
            ) : (
              'Generate Questions'
            )}
          </button>
        </form>

        {generateError && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            ❌ {generateError}
          </div>
        )}

        {generateSuccess && (
          <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
            {generateSuccess}
          </div>
        )}
      </div>

      {/* 2. Filters & View Controls */}
      <div className="p-5 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">2. Filter Question Bank</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Filter by Exam</label>
            <select
              value={filters.exam}
              onChange={(e) => setFilters({ ...filters, exam: e.target.value, topic: '' })}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm text-gray-800 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Exams</option>
              {examOptions.map((exam) => (
                <option key={exam} value={exam}>
                  {exam}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Filter by Topic</label>
            <select
              value={filters.topic}
              onChange={(e) => setFilters({ ...filters, topic: e.target.value })}
              disabled={!filters.exam}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm text-gray-800 focus:outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">All Topics</option>
              {filterTopicOptions.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Filter by Year</label>
            <select
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm text-gray-800 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Years</option>
              {(yearsQuery.data ?? []).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm text-gray-800 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Statuses ({rawQuestions.length})</option>
              <option value="pending">Pending Review ({pendingCount})</option>
              <option value="approved">Approved ({approvedCount})</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Questions List */}
      <div className="space-y-6 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Questions ({questions.length})
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {approvedCount > 0 && <span className="text-green-600 font-semibold mr-3">✅ {approvedCount} approved</span>}
              {pendingCount > 0 && <span className="text-amber-600 font-medium">⏳ {pendingCount} pending review</span>}
            </p>
          </div>

          {pendingCount > 0 && (
            <button
              type="button"
              onClick={handleApproveAllPending}
              className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded hover:bg-green-700 transition flex items-center gap-2"
            >
              Approve All Pending ({pendingCount})
            </button>
          )}
        </div>

        {isQuestionsLoading ? (
          <div className="p-8 text-center bg-white rounded-lg border border-gray-200">
            <span className="animate-spin inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mb-2" />
            <p className="text-sm text-gray-600">Loading questions from database...</p>
          </div>
        ) : questionsError ? (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            ❌ Error loading questions: {questionsError}
          </div>
        ) : questions.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-lg border border-gray-200 text-gray-500">
            <p className="text-lg font-medium text-gray-700 mb-1">No questions found</p>
            <p className="text-sm">Try changing filters or generate questions using the form above.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q, idx) => {
              const isApproved = q.status === 'approved';
              const isApproving = approvingId === q.id;
              const isDeleting = deletingId === q.id;

              return (
                <div
                  key={q.id}
                  className={`p-5 rounded-lg border transition-all ${
                    isApproved
                      ? 'bg-white border-gray-200 shadow-sm hover:border-gray-300'
                      : 'bg-amber-50/30 border-amber-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 text-xs font-bold rounded">
                        #{idx + 1} (ID: {q.id})
                      </span>
                      <span className="text-xs text-gray-500 font-medium">
                        {q.exam || 'General'} • {q.topic}
                      </span>
                      {q.year && (
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded border border-indigo-200">
                          📅 {q.year}
                        </span>
                      )}
                      {q.metadata?.shift && (
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs font-semibold rounded border border-purple-200">
                          ⚡ {q.metadata.shift}
                        </span>
                      )}
                      {q.metadata?.tier && (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded border border-blue-200">
                          🏆 {q.metadata.tier}
                        </span>
                      )}
                    </div>

                    <div>
                      {isApproved ? (
                        <span className="px-2.5 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full flex items-center gap-1">
                          ✅ Approved
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full">
                          Pending Review
                        </span>
                      )}
                    </div>
                  </div>

                  {q.metadata?.paper_title && (
                    <p className="text-xs text-slate-500 italic mb-2">
                      Paper: {q.metadata.paper_title}
                    </p>
                  )}

                  <h3 className="font-semibold text-gray-900 mb-3 text-base leading-relaxed whitespace-pre-wrap">
                    {q.question}
                  </h3>

                  {/* Options Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-sm mb-3">
                    {['A', 'B', 'C', 'D'].map((key) => {
                      const isCorrect = q.correctAnswer === key;
                      return (
                        <div
                          key={key}
                          className={`p-2.5 rounded border ${
                            isCorrect
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-medium'
                              : 'bg-gray-50 border-gray-200 text-gray-800'
                          }`}
                        >
                          <strong>{key})</strong> {q.options?.[key] || 'N/A'}
                          {isCorrect && (
                            <span className="ml-2 text-xs bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-bold">
                              Correct
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Metadata line */}
                  <p className="text-sm mb-3 text-gray-600">
                    <strong>Answer:</strong> <span className="font-bold text-gray-900">{q.correctAnswer}</span> |{' '}
                    <strong>Topic:</strong> {q.topic} | <strong>Exam:</strong> {q.exam || 'N/A'}
                    {q.year && (
                      <>
                        {' '}| <strong>Year:</strong> {q.year}
                      </>
                    )}
                    {q.difficulty && (
                      <>
                        {' '}| <strong>Difficulty:</strong> {q.difficulty}
                      </>
                    )}
                    {q.source && (
                      <>
                        {' '}| <strong>Source:</strong> {q.source}
                      </>
                    )}
                  </p>

                  {/* Explanation */}
                  {q.explanation && (
                    <div className="mb-4 p-3 bg-gray-900 rounded text-sm text-gray-50">
                      <strong className="text-emerald-400">Explanation:</strong>
                      <p className="mt-1 text-gray-200 whitespace-pre-wrap">{q.explanation}</p>
                    </div>
                  )}

                  {/* Card Action Buttons */}
                  <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                    {!isApproved && (
                      <button
                        type="button"
                        onClick={() => handleApprove(q.id)}
                        disabled={isApproving}
                        className="px-4 py-1.5 bg-green-600 text-white rounded text-sm font-semibold hover:bg-green-700 disabled:bg-gray-400 transition flex items-center gap-1.5"
                      >
                        {isApproving ? (
                          <>
                            <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                            Approving...
                          </>
                        ) : (
                          'Approve'
                        )}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(q.id)}
                      disabled={isDeleting}
                      className="px-3 py-1.5 bg-red-500 text-white rounded text-sm font-medium hover:bg-red-600 disabled:bg-gray-400 transition flex items-center gap-1.5"
                    >
                      {isDeleting ? (
                        <>
                          <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                          Deleting...
                        </>
                      ) : (
                        'Delete'
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
