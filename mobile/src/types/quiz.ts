export type QuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
};

export type Quiz = {
  id: string;
  note_id: string;
  user_id: string;
  title: string;
  difficulty_level: number;
  questions: QuizQuestion[];
  created_at: string;
};

export type PlayQuiz = Omit<Quiz, "questions"> & {
  questions: Array<Pick<QuizQuestion, "id" | "prompt" | "options">>;
};

export type QuizAnswerInput = {
  questionId: string;
  selectedIndex: number;
};

export type QuizAttemptBreakdown = {
  questionId: string;
  selectedIndex: number | null;
  correctIndex: number;
  correct: boolean;
  explanation?: string;
};

export type QuizAttempt = {
  id: string;
  quiz_id: string;
  user_id: string;
  score_percent: number;
  time_spent_seconds: number;
  answers: QuizAttemptBreakdown[];
  completed_at: string;
};

export type GenerateQuizResult = {
  quiz: Quiz;
  playQuiz: PlayQuiz;
  cached: boolean;
};

export type SubmitQuizResult = {
  attempt: QuizAttempt;
  result: {
    scorePercent: number;
    correctCount: number;
    total: number;
    answeredCount: number;
    breakdown: QuizAttemptBreakdown[];
  };
};
