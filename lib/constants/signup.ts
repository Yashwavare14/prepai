/**
 * "Which exam are you preparing for?" options on the sign-up form (design: register.html).
 * Values match the exam names used by onboarding and the question bank, so the answer
 * can pre-fill the student profile.
 */
export const SIGNUP_EXAMS = [
  { value: "SSC CGL", label: "SSC CGL" },
  { value: "SSC CHSL", label: "SSC CHSL" },
  { value: "IBPS PO", label: "Banking (IBPS PO)" },
  { value: "RRB NTPC", label: "Railways (NTPC)" },
  { value: "Other", label: "Other" },
] as const;

export type SignupExam = (typeof SIGNUP_EXAMS)[number]["value"];

export const SIGNUP_EXAM_VALUES = SIGNUP_EXAMS.map((e) => e.value) as [SignupExam, ...SignupExam[]];

/**
 * Institute codes need the institutes table (PLAN.md Phase 3). Until then the field is
 * hidden; set NEXT_PUBLIC_FEATURE_INSTITUTE_JOIN=1 once codes can be validated.
 */
export const INSTITUTE_JOIN_ENABLED = process.env.NEXT_PUBLIC_FEATURE_INSTITUTE_JOIN === "1";
