'use client';

import { useEffect, useState } from 'react';

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ exam: '', topic: '' });
  const [exams, setExams] = useState([]);
  const [topics, setTopics] = useState([]);
  const staticExamOptions = ['SSC CGL', 'RRB', 'IBPS', 'UPSC', 'Bank PO'];
  const staticTopicOptions = ['Quants', 'GK', 'Reasoning', 'English', 'General Science'];
  const examOptions = exams.length ? exams : staticExamOptions;
  const topicOptions = topics.length ? topics : staticTopicOptions;
  const [generateForm, setGenerateForm] = useState({ exam: '', topic: '', difficulty: 'medium', count: 10 });
  const [generateLoading, setGenerateLoading] = useState(false);
  const [generateError, setGenerateError] = useState(null);
  const [generateSuccess, setGenerateSuccess] = useState(null);

  const fetchQuestions = async (filterValues = filters) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterValues.exam) params.append('exam', filterValues.exam);
      if (filterValues.topic) params.append('topic', filterValues.topic);

      const res = await fetch(`/api/admin/questions?${params}`);
      const data = await res.json();
      setQuestions(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err.message);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuestions = async (e) => {
    e.preventDefault();
    setGenerateError(null);
    setGenerateSuccess(null);

    if (!generateForm.exam || !generateForm.topic) {
      setGenerateError('Exam and topic are required to generate questions.');
      return;
    }

    try {
      setGenerateLoading(true);
      const res = await fetch('/api/admin/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generateForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate questions.');
      setGenerateSuccess(`Generated ${data.generatedCount} questions and saved them as pending review.`);
      setGenerateForm({ ...generateForm, count: 10 });
      fetchQuestions();
    } catch (err) {
      setGenerateError(err.message);
    } finally {
      setGenerateLoading(false);
    }
  };

  // Fetch exams on mount
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await fetch('/api/filters/exams');
        const data = await res.json();
        setExams(data);
      } catch (err) {
        console.error('Failed to fetch exams:', err);
      }
    };
    fetchExams();
  }, []);

  // Fetch topics when exam changes
  useEffect(() => {
    if (!filters.exam) {
      setTopics([]);
      return;
    }
    const fetchTopics = async () => {
      try {
        const res = await fetch(`/api/filters/topics?exam=${encodeURIComponent(filters.exam)}`);
        const data = await res.json();
        setTopics(data);
      } catch (err) {
        console.error('Failed to fetch topics:', err);
      }
    };
    fetchTopics();
  }, [filters.exam]);

  // Fetch questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (filters.exam) params.append('exam', filters.exam);
        if (filters.topic) params.append('topic', filters.topic);
        
        const res = await fetch(`/api/admin/questions?${params}`);
        const data = await res.json();
        
        // Ensure data is always an array
        setQuestions(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        setError(err.message);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [filters]);

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`/api/admin/questions/${id}/approve`, {
        method: 'PATCH',
      });
      if (res.ok) {
        setQuestions(questions.map(q => 
          q.id === id ? { ...q, status: 'approved' } : q
        ));
      }
    } catch (err) {
      console.error('Failed to approve:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
      const res = await fetch(`/api/admin/questions/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setQuestions(questions.filter(q => q.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Manage Questions</h1>
      {/* Generate Questions */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl text-gray-800 font-semibold mb-4">Generate Questions</h2>
        <form onSubmit={handleGenerateQuestions} className="grid gap-4 md:grid-cols-4">
          <select
            value={generateForm.exam}
            onChange={(e) => setGenerateForm({ ...generateForm, exam: e.target.value, topic: '' })}
            className="w-full px-3 py-2 border rounded bg-gray-50 text-gray-700"
            required
          >
            <option value="">Select Exam</option>
            <option value="SSC CGL">SSC CGL</option>
            <option value="RRB">RRB</option>
            <option value="IBPS">IBPS</option>
            <option value="UPSC">UPSC</option>
            <option value="Bank PO">Bank PO</option>
          </select>
          <select
            value={generateForm.topic}
            onChange={(e) => setGenerateForm({ ...generateForm, topic: e.target.value })}
            className="w-full px-3 py-2 border rounded bg-gray-50 text-gray-700"
            required
            disabled={!generateForm.exam}
          >
            <option value="">Select Topic</option>
            <option value="Quants">Quants</option>
            <option value="GK">GK</option>
            <option value="Reasoning">Reasoning</option>
            <option value="English">English</option>
            <option value="General Science">General Science</option>
          </select>
          <select
            value={generateForm.difficulty}
            onChange={(e) => setGenerateForm({ ...generateForm, difficulty: e.target.value })}
            className="w-full px-3 py-2 border rounded bg-gray-50 text-gray-700"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <div className="flex gap-2">
            <input
              type="number"
              min="5"
              max="50"
              value={generateForm.count}
              onChange={(e) => setGenerateForm({ ...generateForm, count: Number(e.target.value) })}
              className="w-full px-3 py-2 border rounded bg-gray-50 text-gray-700"
            />
            <button
              type="submit"
              disabled={generateLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {generateLoading ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </form>
        {generateError && <p className="mt-3 text-sm text-red-600">{generateError}</p>}
        {generateSuccess && <p className="mt-3 text-sm text-green-600">{generateSuccess}</p>}
      </div>
      {/* Filters */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <div className="grid grid-cols-2 gap-4">
          <select
            value={filters.exam}
            onChange={(e) => setFilters({ ...filters, exam: e.target.value, topic: '' })}
            className="p-2 border rounded text-gray-500"
          >
            <option value="">Select Exam</option>
            {examOptions.map((exam) => (
              <option key={exam} value={exam}>{exam}</option>
            ))}
          </select>
          <select
            value={filters.topic}
            onChange={(e) => setFilters({ ...filters, topic: e.target.value })}
            className="p-2 border rounded text-gray-500"
            disabled={!filters.exam}
          >
            <option value="">Select Topic</option>
            {topicOptions.map((topic) => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Questions List */}
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-600">Error: {error}</p>
      ) : (
        <div className="space-y-4">
          {questions.map(q => (
            <div key={q.id} className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">{q.question}</h3>
              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <p><strong>A)</strong> {q.options.A}</p>
                <p><strong>B)</strong> {q.options.B}</p>
                <p><strong>C)</strong> {q.options.C}</p>
                <p><strong>D)</strong> {q.options.D}</p>
              </div>
              <p className="text-sm mb-2">
                <strong>Answer:</strong> {q.correctAnswer} | 
                <strong className="ml-2">Status:</strong> {q.status} |
                <strong className="ml-2">Topic:</strong> {q.topic}
              </p>
              {q.explanation && (
                <div className="mb-3 p-2 bg-gray-900 rounded text-sm text-gray-50">
                  <strong>Explanation:</strong>
                  <p className="mt-1 text-gray-50">{q.explanation}</p>
                </div>
              )}
              <div className="flex gap-2">
                {q.status === 'pending_review' && (
                  <button
                    onClick={() => handleApprove(q.id)}
                    className="px-3 py-1 bg-green-500 text-white rounded text-sm"
                  >
                    Approve
                  </button>
                )}
                <button
                  onClick={() => handleDelete(q.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded text-sm cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {questions.length === 0 && <p>No questions found</p>}
        </div>
      )}
    </div>
  );
}
