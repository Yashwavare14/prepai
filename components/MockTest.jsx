'use client';

import { useState } from 'react';

export default function MockTest({ test }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelectAnswer = (questionId, answer) => {
    if (!submitted) {
      setAnswers({ ...answers, [questionId]: answer });
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const calculateScore = () => {
    let correct = 0;
    test.questions.forEach(q => {
      if (answers[q.id] === q.correct_answer) {
        correct++;
      }
    });
    return { correct, total: test.questions.length };
  };

  const score = submitted ? calculateScore() : null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 p-4 bg-blue-100 rounded-lg">
        <h2 className="text-2xl font-bold">{test.title}</h2>
        <p className="text-gray-600">
          {test.total_questions} questions | {test.time_limit_minutes} minutes
        </p>
      </div>

      {submitted && score && (
        <div className="mb-6 p-4 bg-green-100 rounded-lg">
          <h3 className="text-xl font-bold">
            Score: {score.correct}/{score.total}
          </h3>
          <p className="text-gray-600">
            Percentage: {((score.correct / score.total) * 100).toFixed(1)}%
          </p>
        </div>
      )}

      <div className="space-y-6">
        {test.questions.map((q, idx) => {
          const isAnswered = answers[q.id] !== undefined;
          const isCorrect = answers[q.id] === q.correct_answer;

          return (
            <div
              key={q.id}
              className={`p-4 rounded-lg border-2 ${
                submitted
                  ? isCorrect
                    ? 'bg-green-50 border-green-300'
                    : isAnswered
                    ? 'bg-red-50 border-red-300'
                    : 'bg-gray-50 border-gray-300'
                  : 'bg-white border-gray-300'
              }`}
            >
              <h3 className="font-semibold mb-3 text-gray-700">
                Q{idx + 1}: {q.question}
              </h3>

              <div className="space-y-2 mb-4 text-gray-600">
                {['A', 'B', 'C', 'D'].map(option => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name={`question-${q.id}`}
                      value={option}
                      checked={answers[q.id] === option}
                      onChange={() => handleSelectAnswer(q.id, option)}
                      disabled={submitted}
                      className="mr-2"
                    />
                    <span className={
                      submitted && option === q.correct_answer
                        ? 'text-green-700 font-semibold'
                        : submitted && answers[q.id] === option && option !== q.correct_answer
                        ? 'text-red-700'
                        : ''
                    }>
                      {option}) {q.options[option]}
                    </span>
                    {submitted && option === q.correct_answer && (
                      <span className="ml-2 text-green-600">✓</span>
                    )}
                  </label>
                ))}
              </div>

              {submitted && (
                <div className="p-3 bg-yellow-50 rounded text-sm">
                  <strong>Explanation:</strong> {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!submitted && (
        <button
          onClick={handleSubmit}
          className="mt-6 w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
        >
          Submit Test
        </button>
      )}
    </div>
  );
}
