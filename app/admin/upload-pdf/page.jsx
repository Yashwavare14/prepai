'use client';

import { useState } from 'react';

export default function UploadPdfPage() {
  const [file, setFile] = useState(null);
  const [exam, setExam] = useState('');
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !exam || !topic) {
      setError('Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('exam', exam);
      formData.append('topic', topic);

      const res = await fetch('/api/admin/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess(`✅ Successfully extracted ${data.questionsExtracted} questions!`);
      setFile(null);
      setExam('');
      setTopic('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Upload PDF Questions</h1>

      <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-lg border border-gray-200 space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">Exam</label>
          <input
            type="text"
            placeholder="e.g., SSC CGL"
            value={exam}
            onChange={(e) => setExam(e.target.value)}
            required
            className="w-full px-4 py-2 bg-white border-2 border-gray-300 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">Topic</label>
          <input
            type="text"
            placeholder="e.g., Quants"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
            className="w-full px-4 py-2 bg-white border-2 border-gray-300 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
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
          disabled={loading}
          className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {loading ? 'Processing...' : 'Upload & Parse'}
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
