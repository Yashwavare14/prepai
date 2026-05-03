'use client';

import { useEffect, useState } from 'react';

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ exam: '', topic: '' });
  const [exams, setExams] = useState([]);
  const [topics, setTopics] = useState([]);

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

      {/* Filters */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <div className="grid grid-cols-2 gap-4">
          <select
            value={filters.exam}
            onChange={(e) => setFilters({ ...filters, exam: e.target.value, topic: '' })}
            className="p-2 border rounded text-gray-500"
          >
            <option value="">Select Exam</option>
            {exams.map(exam => (
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
            {topics.map(topic => (
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
                <strong className="ml-2">Status:</strong> {q.status}
              </p>
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
