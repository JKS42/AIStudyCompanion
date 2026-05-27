export const QUIZ_PROMPT_VERSION = "quiz-v1";

const DIFFICULTY_LABELS = {
  1: "easy (foundational recall)",
  2: "medium (application and connections)",
  3: "hard (analysis and edge cases)"
};

export function buildQuizMessages(studyText, meta = {}) {
  const level = meta.difficultyLevel ?? 2;
  const label = DIFFICULTY_LABELS[level] ?? DIFFICULTY_LABELS[2];
  const titleLine = meta.title ? `Title: ${meta.title}\n` : "";

  return [
    {
      role: "system",
      content: `You create multiple-choice study quizzes from source material.
Return JSON only:
{"questions":[{"id":"q1","prompt":"string","options":["A","B","C","D"],"correctIndex":0,"explanation":"string"}]}
Rules:
- 5 to 8 questions
- Exactly 4 options per question
- correctIndex is 0-3
- Difficulty: ${label}
- Questions must be answerable from the source text only`
    },
    {
      role: "user",
      content: `${titleLine}Source material:\n\n${studyText}`
    }
  ];
}
