import db from "./index.js";
import { questions } from "./schema.js";

const seedQuestions = [
  {
    question: "A train travels 360 km in 4 hours. What is its speed in m/s?",
    options: { A: "25 m/s", B: "90 m/s", C: "100 m/s", D: "40 m/s" },
    correctAnswer: "A",
    explanation: "360 km/4 hr = 90 km/hr. Convert: 90 × (5/18) = 25 m/s",
    topic: "Quants",
    exam: "SSC CGL",
    difficulty: "medium",
    source: "manual",
  },
  {
    question: "Which article of the Indian Constitution abolishes untouchability?",
    options: { A: "Article 14", B: "Article 15", C: "Article 17", D: "Article 21" },
    correctAnswer: "C",
    explanation: "Article 17 abolishes untouchability and forbids its practice in any form.",
    topic: "GK",
    exam: "SSC CGL",
    difficulty: "easy",
    source: "manual",
  },
  {
    question: "If CODING is written as DPEJOH, how is MONEY written?",
    options: { A: "NPOFZ", B: "NOPEY", C: "LNMDX", D: "MOOFZ" },
    correctAnswer: "A",
    explanation: "Each letter is shifted +1 in the alphabet: M→N, O→P, N→O, E→F, Y→Z",
    topic: "Reasoning",
    exam: "SSC CGL",
    difficulty: "medium",
    source: "manual",
  },
  {
    question: "Choose the correctly spelt word:",
    options: { A: "Acommodate", B: "Accommodate", C: "Accomodate", D: "Acomodate" },
    correctAnswer: "B",
    explanation: "'Accommodate' has double 'c' and double 'm'.",
    topic: "English",
    exam: "SSC CGL",
    difficulty: "easy",
    source: "manual",
  },
];

async function seed() {
  console.log("Seeding questions...");
  await db.insert(questions).values(seedQuestions);
  console.log(`Inserted ${seedQuestions.length} questions.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
