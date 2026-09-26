// Canonical taxonomy for Exam Paper Sections (Subjects) and granular Topics

export const EXAM_SECTIONS = [
  'Quantitative Aptitude',
  'Reasoning & Intelligence',
  'General Awareness',
  'English Comprehension',
];

export const SECTION_TOPICS = {
  'Quantitative Aptitude': [
    // Arithmetic
    'Number System',
    'LCM & HCF',
    'Simplification & Approximation',
    'Percentage',
    'Ratio & Proportion',
    'Average',
    'Profit, Loss & Discount',
    'Simple & Compound Interest',
    'Time & Work',
    'Pipes & Cisterns',
    'Time, Speed & Distance',
    'Trains, Boats & Streams',
    'Mixture & Alligation',
    'Partnership & Ages',
    // Advanced Math
    'Algebra',
    'Geometry',
    'Mensuration 2D',
    'Mensuration 3D',
    'Trigonometry',
    'Heights & Distances',
    'Coordinate Geometry',
    // Modern Math & DI
    'Permutation & Combination',
    'Probability',
    'Data Interpretation (DI)',
  ],

  'Reasoning & Intelligence': [
    // Verbal & Logical
    'Analogy',
    'Classification / Odd One Out',
    'Series Completion',
    'Coding-Decoding',
    'Blood Relations',
    'Direction & Distance',
    'Order & Ranking',
    'Seating Arrangement',
    'Syllogism',
    'Venn Diagrams',
    'Inequalities',
    'Mathematical Operations',
    'Word Formation & Dictionary Order',
    'Clock & Calendar',
    // Non-Verbal
    'Mirror & Water Images',
    'Paper Cutting & Folding',
    'Embedded Figures',
    'Figure Completion & Counting',
    'Cube & Dice',
    'Figure Series & Pattern Matrix',
    // Critical Reasoning
    'Statement & Assumptions',
    'Statement & Conclusions',
    'Statement & Arguments',
    'Cause & Effect',
    'Assertion & Reason',
  ],

  'General Awareness': [
    // General Science
    'Physics',
    'Chemistry',
    'Biology',
    'Scientific Inventions & Discoveries',
    // Polity
    'Indian Constitution & Preamble',
    'Fundamental Rights & Duties',
    'President, PM & Parliament',
    'Indian Judiciary',
    'Constitutional Bodies & Articles',
    'Local Governance & Panchayati Raj',
    // History & Culture
    'Ancient Indian History',
    'Medieval Indian History',
    'Modern Indian History & Freedom Struggle',
    'Art, Culture, Dances & Festivals',
    // Geography
    'Indian Rivers & Physical Features',
    'Climate, Monsoons & Soil',
    'Agriculture, Minerals & Industries',
    'World Geography & Solar System',
    'Ecology, National Parks & Biospheres',
    // Economy
    'Indian Economy & Macroeconomics',
    'Banking System & RBI',
    'Union Budget & Economic Schemes',
    // Current Affairs & Static GK
    'Sports & Championships',
    'Awards, Honours & Nobel Prizes',
    'Important Days & Themes',
    'International Organizations',
    'Books & Authors',
    'Defense & Military Exercises',
  ],

  'English Comprehension': [
    // Vocabulary
    'Synonyms & Antonyms',
    'Idioms & Phrases',
    'One Word Substitution',
    'Spelling Errors',
    'Homonyms & Confusing Words',
    // Grammar
    'Spotting the Error',
    'Sentence Improvement',
    'Fill in the Blanks',
    'Active & Passive Voice',
    'Direct & Indirect Speech',
    // Reading & Verbal Ability
    'Reading Comprehension Passages',
    'Cloze Test',
    'Para Jumbles (Sentence Rearrangement)',
    'Sentence Completion & Connectors',
  ],
};

// Aliases mapping to canonical section names
const SECTION_ALIASES = {
  'quants': 'Quantitative Aptitude',
  'quant': 'Quantitative Aptitude',
  'quantitative aptitude': 'Quantitative Aptitude',
  'maths': 'Quantitative Aptitude',
  'mathematics': 'Quantitative Aptitude',
  'math': 'Quantitative Aptitude',

  'reasoning': 'Reasoning & Intelligence',
  'reasoning & intelligence': 'Reasoning & Intelligence',
  'general intelligence': 'Reasoning & Intelligence',
  'logical reasoning': 'Reasoning & Intelligence',
  'gi': 'Reasoning & Intelligence',

  'gk': 'General Awareness',
  'ga': 'General Awareness',
  'general awareness': 'General Awareness',
  'general knowledge': 'General Awareness',
  'general science': 'General Awareness',
  'gs': 'General Awareness',

  'english': 'English Comprehension',
  'english comprehension': 'English Comprehension',
  'english language': 'English Comprehension',
  'verbal ability': 'English Comprehension',
};

/**
 * Normalizes any variation of section/subject name into the standard canonical section.
 */
export function normalizeSection(rawSection) {
  if (!rawSection || typeof rawSection !== 'string') return null;
  const cleaned = rawSection.trim().toLowerCase();
  return SECTION_ALIASES[cleaned] || rawSection.trim();
}

/**
 * Returns the list of topics for a given section, or all topics if no section provided.
 */
export function getTopicsForSection(section) {
  const normalized = normalizeSection(section);
  if (normalized && SECTION_TOPICS[normalized]) {
    return SECTION_TOPICS[normalized];
  }
  return Object.values(SECTION_TOPICS).flat();
}
