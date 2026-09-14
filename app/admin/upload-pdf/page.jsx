'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchExams, fetchTopics, uploadPdf, extractPdfSections, saveExtractedQuestions } from '@/lib/queries/admin';

const staticExamOptions = ['SSC CGL', 'RRB', 'IBPS', 'UPSC', 'Bank PO'];
const staticTopicOptions = ['Quants', 'GK', 'Reasoning', 'English', 'General Science'];

const providerModels = {
  gemini: [
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Recommended)' },
    { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
    { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
  ],
  openai: [
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  ],
};

const formatError = (error) => {
  if (error instanceof Error) return error.message;
  return String(error ?? 'Unknown error');
};

export default function UploadPdfPage() {
  const [file, setFile] = useState(null);
  const [exam, setExam] = useState('');
  const [topic, setTopic] = useState('');
  const [provider, setProvider] = useState('gemini');
  const [model, setModel] = useState('gemini-2.5-flash');
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('all');
  const [isLoadingSections, setIsLoadingSections] = useState(false);
  const [sectionStatus, setSectionStatus] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Extracted questions state for interactive live review
  const [extractedQuestions, setExtractedQuestions] = useState([]);
  const [savingId, setSavingId] = useState(null);

  const queryClient = useQueryClient();

  const examsQuery = useQuery({
    queryKey: ['adminExams'],
    queryFn: fetchExams,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });

  const topicsQuery = useQuery({
    queryKey: ['adminTopics', exam],
    queryFn: fetchTopics,
    enabled: Boolean(exam),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });

  // 1. Extract questions from PDF via external service
  const uploadMutation = useMutation({
    mutationFn: uploadPdf,
    onSuccess: (data) => {
      const questionsList = data.questions || [];
      setExtractedQuestions(questionsList);
      setSuccess(`✅ Successfully extracted ${questionsList.length} questions! Review and approve them below.`);
      setError(null);
      // Invalidate questions list in background
      queryClient.invalidateQueries({ queryKey: ['adminQuestions'] });
    },
    onError: (error) => {
      setError(formatError(error));
      setSuccess(null);
    },
  });

  // 2. Save single approved question
  const saveSingleMutation = useMutation({
    mutationFn: saveExtractedQuestions,
    onSuccess: (_, variables) => {
      // Mark approved in local state
      const targetTempId = variables.tempId;
      setExtractedQuestions((prev) =>
        prev.map((q) => (q.tempId === targetTempId ? { ...q, status: 'approved' } : q))
      );
      setSavingId(null);
      queryClient.invalidateQueries({ queryKey: ['adminQuestions'] });
    },
    onError: (err) => {
      setError(`Failed to save question: ${formatError(err)}`);
      setSavingId(null);
    },
  });

  // 3. Batch approve all remaining unapproved questions
  const saveAllMutation = useMutation({
    mutationFn: saveExtractedQuestions,
    onSuccess: (res) => {
      setExtractedQuestions((prev) =>
        prev.map((q) => ({ ...q, status: 'approved' }))
      );
      setSuccess(`✅ Successfully approved & saved ${res.count} questions to the database!`);
      queryClient.invalidateQueries({ queryKey: ['adminQuestions'] });
    },
    onError: (err) => {
      setError(`Failed to batch save questions: ${formatError(err)}`);
    },
  });

  const examOptions = examsQuery.data?.length ? examsQuery.data : staticExamOptions;
  const topicOptions = topicsQuery.data?.length ? topicsQuery.data : staticTopicOptions;
  const isUploading = uploadMutation.isLoading;
  const isSavingAll = saveAllMutation.isLoading;

  const handleProviderChange = (e) => {
    const newProvider = e.target.value;
    setProvider(newProvider);
    setModel(providerModels[newProvider]?.[0]?.value || '');
  };

  const handleLoadSections = async () => {
    if (!file) {
      setError('Please select a PDF file first.');
      return;
    }

    setIsLoadingSections(true);
    setSectionStatus('Contacting external parser service...');
    setError(null);

    try {
      const formData = new FormData();
      formData.append('pdfFile', file);
      formData.append('provider', provider);
      formData.append('model', model);

      const res = await extractPdfSections(formData);
      if (res.sections && res.sections.length > 0) {
        setSections(res.sections);
        setSectionStatus(`Loaded ${res.sections.length} sections successfully.`);
      } else {
        setSections([]);
        setSectionStatus('No distinct sections detected. You can extract all blocks directly.');
      }
    } catch (err) {
      setError(`Failed to load sections: ${formatError(err)}`);
      setSectionStatus(null);
    } finally {
      setIsLoadingSections(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !exam || !topic) {
      setError('Please fill in exam, topic, and choose a PDF file.');
      return;
    }

    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('pdfFile', file);
    formData.append('exam', exam);
    formData.append('topic', topic);
    formData.append('section', selectedSection);
    formData.append('provider', provider);
    formData.append('model', model);

    uploadMutation.mutate(formData);
  };

  const handleApproveSingle = (question) => {
    setSavingId(question.tempId);
    setError(null);
    saveSingleMutation.mutate({
      tempId: question.tempId,
      questions: [question],
      exam: question.exam || exam,
      topic: question.topic || topic,
      filename: question.source || file?.name || 'pdf-extract',
      status: 'approved',
    });
  };

  const handleDeleteFromPreview = (tempId) => {
    setExtractedQuestions((prev) => prev.filter((q) => q.tempId !== tempId));
  };

  const handleApproveAll = () => {
    const unapproved = extractedQuestions.filter((q) => q.status !== 'approved');
    if (unapproved.length === 0) return;

    setError(null);
    saveAllMutation.mutate({
      questions: unapproved,
      exam,
      topic,
      filename: file?.name || 'pdf-extract',
      status: 'approved',
    });
  };

  const unapprovedCount = extractedQuestions.filter((q) => q.status !== 'approved').length;
  const approvedCount = extractedQuestions.filter((q) => q.status === 'approved').length;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Upload PDF Questions</h1>
        <p className="text-sm text-gray-500 mt-1">
          Extract questions via external service, preview and inspect them, and approve them into the database.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-lg border border-gray-200 space-y-6">
        {/* PDF File Input & Section Loader */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">1. Select Document &amp; AI Engine</h2>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">PDF File</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => {
                setFile(e.target.files?.[0] || null);
                setSections([]);
                setSelectedSection('all');
                setSectionStatus(null);
              }}
              required
              className="w-full px-4 py-2 bg-white border-2 border-gray-300 rounded text-gray-900 focus:outline-none focus:border-blue-500"
            />
          </div>

          {file && (
            <p className="text-sm text-gray-600 font-medium">
              📄 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">AI Provider</label>
              <select
                value={provider}
                onChange={handleProviderChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm text-gray-800 focus:outline-none focus:border-blue-500"
              >
                <option value="gemini">Gemini</option>
                <option value="openai">OpenAI</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">AI Model</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm text-gray-800 focus:outline-none focus:border-blue-500"
              >
                {providerModels[provider]?.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleLoadSections}
              disabled={!file || isLoadingSections}
              className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded hover:bg-slate-900 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              {isLoadingSections ? (
                <>
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Loading Sections...
                </>
              ) : (
                'Inspect PDF Sections'
              )}
            </button>
            {sectionStatus && <span className="text-xs text-slate-600">{sectionStatus}</span>}
          </div>

          {/* If sections were detected */}
          {sections.length > 0 && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
              <label className="block text-sm font-semibold text-blue-900 mb-1">
                Detected Paper Section to Extract:
              </label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-blue-300 rounded text-sm text-gray-800 focus:outline-none focus:border-blue-500"
              >
                <option value="all">Extract All Sections</option>
                {sections.map((s, idx) => (
                  <option key={idx} value={s.name}>
                    {s.name} {s.description ? `(${s.description})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Exam & Topic Mapping */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">2. Assign to Exam &amp; Topic</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Target Exam</label>
              <select
                value={exam}
                onChange={(e) => {
                  setExam(e.target.value);
                  setTopic('');
                }}
                required
                className="w-full px-4 py-2 bg-white border-2 border-gray-300 rounded text-gray-900 focus:outline-none focus:border-blue-500"
              >
                <option value="">Select Exam</option>
                {examOptions.map((examOption) => (
                  <option key={examOption} value={examOption}>
                    {examOption}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Target Topic</label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
                disabled={!exam}
                className="w-full px-4 py-2 bg-white border-2 border-gray-300 rounded text-gray-900 focus:outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Select Topic</option>
                {topicOptions.map((topicOption) => (
                  <option key={topicOption} value={topicOption}>
                    {topicOption}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isUploading || !file || !exam || !topic}
          className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 text-base"
        >
          {isUploading ? (
            <>
              <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              Extracting Questions from PDF...
            </>
          ) : (
            'Extract & Preview Questions'
          )}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          ❌ {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      {/* Freshly Extracted Questions Preview & Approve Section */}
      {extractedQuestions.length > 0 && (
        <div className="space-y-6 pt-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Freshly Extracted Questions ({extractedQuestions.length})
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {approvedCount > 0 && <span className="text-green-600 font-semibold mr-3">✅ {approvedCount} approved</span>}
                {unapprovedCount > 0 && <span className="text-amber-600 font-medium">⏳ {unapprovedCount} pending approval</span>}
                {unapprovedCount === 0 && <span className="text-green-600 font-medium">All questions approved and saved!</span>}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {unapprovedCount > 0 && (
                <button
                  type="button"
                  onClick={handleApproveAll}
                  disabled={isSavingAll}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded hover:bg-green-700 disabled:bg-gray-400 transition flex items-center gap-2"
                >
                  {isSavingAll ? (
                    <>
                      <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      Approving All...
                    </>
                  ) : (
                    `Approve All (${unapprovedCount})`
                  )}
                </button>
              )}
              <button
                type="button"
                onClick={() => setExtractedQuestions([])}
                className="px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-100 transition"
              >
                Clear Preview
              </button>
            </div>
          </div>

          {/* List of Question Cards matching /admin/questions style */}
          <div className="space-y-4">
            {extractedQuestions.map((q, idx) => {
              const isApproved = q.status === 'approved';
              const isSavingThis = savingId === q.tempId;

              return (
                <div
                  key={q.tempId || idx}
                  className={`p-5 rounded-lg border transition-all ${
                    isApproved
                      ? 'bg-green-50/40 border-green-300'
                      : 'bg-white border-gray-200 shadow-sm hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 text-xs font-bold rounded">
                        Q{idx + 1}
                      </span>
                      <span className="text-xs text-gray-500 font-medium">
                        {q.exam} • {q.topic}
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
                          ✅ Approved &amp; Saved
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full">
                          Pending Approval
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

                  {/* Answer & Status Line */}
                  <p className="text-sm mb-3 text-gray-600">
                    <strong>Answer:</strong> <span className="font-bold text-gray-900">{q.correctAnswer}</span> |{' '}
                    <strong>Topic:</strong> {q.topic} | <strong>Exam:</strong> {q.exam}
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
                    {!isApproved ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleApproveSingle(q)}
                          disabled={isSavingThis}
                          className="px-4 py-1.5 bg-green-600 text-white rounded text-sm font-semibold hover:bg-green-700 disabled:bg-gray-400 transition flex items-center gap-1.5"
                        >
                          {isSavingThis ? (
                            <>
                              <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                              Approving...
                            </>
                          ) : (
                            'Approve'
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteFromPreview(q.tempId)}
                          className="px-3 py-1.5 bg-red-500 text-white rounded text-sm font-medium hover:bg-red-600 transition"
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-green-700 font-medium">
                        This question is stored in the database.
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
