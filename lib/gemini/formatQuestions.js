export function formatQuestionsForPrompt(questions) {
  return questions.map((q, i) => {
    const opts = q.options;
    return `
Q${i + 1}: ${q.question}
A) ${opts.A}
B) ${opts.B}
C) ${opts.C}
D) ${opts.D}
Correct Answer: ${q.correctAnswer}
Explanation: ${q.explanation || "N/A"}
    `.trim();
  }).join("\n\n");
}
