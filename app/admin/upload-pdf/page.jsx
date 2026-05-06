'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchExams, fetchTopics, uploadPdf } from '@/lib/queries/admin';

const staticExamOptions = ['SSC CGL', 'RRB', 'IBPS', 'UPSC', 'Bank PO'];
const staticTopicOptions = ['Quants', 'GK', 'Reasoning', 'English', 'General Science'];

const formatError = (error) => {
  if (error instanceof Error) return error.message;
  return String(error ?? 'Unknown error');
};

export default function UploadPdfPage() {
  const [file, setFile] = useState(null);
  const [exam, setExam] = useState('');
  const [topic, setTopic] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

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

  const uploadMutation = useMutation({
    mutationFn: uploadPdf,
    onSuccess: (data) => {
      setSuccess(`✅ Successfully extracted ${data.questionsExtracted} questions!`);
      setError(null);
      setFile(null);
      setExam('');
      setTopic('');
      // Invalidate questions list to show new questions
      queryClient.invalidateQueries({ queryKey: ['adminQuestions'] });
    },
    onError: (error) => {
      setError(formatError(error));
      setSuccess(null);
    },
  });

  const examOptions = examsQuery.data?.length ? examsQuery.data : staticExamOptions;
  const topicOptions = topicsQuery.data?.length ? topicsQuery.data : staticTopicOptions;
  const isUploading = uploadMutation.isLoading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !exam || !topic) {
      setError('Please fill all fields');
      return;
    }

    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('exam', exam);
    formData.append('topic', topic);

    uploadMutation.mutate(formData);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Upload PDF Questions</h1>

      <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-lg border border-gray-200 space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">Exam</label>
          <select
            value={exam}
            onChange={(e) => {
              setExam(e.target.value);
              setTopic(''); // Reset topic when exam changes
            }}
            required
            className="w-full px-4 py-2 bg-white border-2 border-gray-300 rounded text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
          <label className="block text-sm font-semibold mb-2 text-gray-700">Topic</label>
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
            disabled={!exam}
            className="w-full px-4 py-2 bg-white border-2 border-gray-300 rounded text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Select Topic</option>
            {topicOptions.map((topicOption) => (
              <option key={topicOption} value={topicOption}>
                {topicOption}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">PDF File</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required
            className="w-full px-4 py-2 bg-white border-2 border-gray-300 rounded text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {file && (
          <p className="text-sm text-gray-600">📄 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</p>
        )}

        <button
          type="submit"
          disabled={isUploading}
          className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {isUploading ? 'Processing...' : 'Upload & Parse'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          ❌ {error}
        </div>
      )}

      {success && (
        <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}
    </div>
  );
}
