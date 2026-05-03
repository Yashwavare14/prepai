'use client';

import { useState } from 'react';
import MockTest from '@/components/MockTest';

export default function TestPage() {
  const [mockTest, setMockTest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    exam: '',
    topic: '',
    difficulty: 'medium',
    count: 20,
  });

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/generate-mock-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMockTest(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Generate Mock Test</h1>

      {!mockTest ? (
        <form onSubmit={handleGenerate} className="p-6 bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Exam (e.g., SSC CGL)"
              value={formData.exam}
              onChange={(e) => setFormData({ ...formData, exam: e.target.value })}
              required
              className="w-full px-4 py-2 bg-white border-2 border-gray-300 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Topic (e.g., Quants)"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              required
              className="w-full px-4 py-2 bg-white border-2 border-gray-300 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              className="w-full px-4 py-2 bg-white border-2 border-gray-300 rounded text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <input
              type="number"
              min="5"
              max="50"
              placeholder="Number of questions (5-50)"
              value={formData.count}
              onChange={(e) => setFormData({ ...formData, count: parseInt(e.target.value) })}
              className="w-full px-4 py-2 bg-white border-2 border-gray-300 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Generating...' : 'Generate Test'}
            </button>
          </div>
        </form>
      ) : (
        <>
          <button
            onClick={() => setMockTest(null)}
            className="mb-4 px-4 py-2 bg-gray-600 text-white rounded"
          >
            ← Back to Form
          </button>
          <MockTest test={mockTest} />
        </>
      )}

      {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
    </div>
  );
}
