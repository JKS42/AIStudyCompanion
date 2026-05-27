import { apiFetch } from "../shared/api";
import { supabase } from "../shared/supabase";
import type {
  GenerateQuizResult,
  PlayQuiz,
  Quiz,
  QuizAnswerInput,
  QuizAttempt,
  SubmitQuizResult
} from "../types/quiz";

export async function listQuizzesForNote(noteId: string): Promise<Quiz[]> {
  const { data, error } = await supabase
    .from("quizzes")
    .select("*")
    .eq("note_id", noteId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Quiz[];
}

export async function listAttemptsForQuiz(quizId: string): Promise<QuizAttempt[]> {
  const { data, error } = await supabase
    .from("quiz_attempts")
    .select("*")
    .eq("quiz_id", quizId)
    .order("completed_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as QuizAttempt[];
}

export async function generateQuiz(
  noteId: string,
  accessToken: string,
  options: { difficultyLevel: number; force?: boolean }
): Promise<GenerateQuizResult> {
  return apiFetch<GenerateQuizResult>("/api/ai/quiz/generate", {
    method: "POST",
    accessToken,
    body: JSON.stringify({
      noteId,
      difficultyLevel: options.difficultyLevel,
      force: options.force ?? false
    })
  });
}

export async function fetchQuizForPlay(quizId: string, accessToken: string): Promise<PlayQuiz> {
  const payload = await apiFetch<{ quiz: PlayQuiz }>(`/api/ai/quiz/${quizId}/play`, {
    method: "GET",
    accessToken
  });
  return payload.quiz;
}

export async function submitQuizAttempt(
  quizId: string,
  accessToken: string,
  answers: QuizAnswerInput[],
  timeSpentSeconds: number
): Promise<SubmitQuizResult> {
  return apiFetch<SubmitQuizResult>(`/api/ai/quiz/${quizId}/attempt`, {
    method: "POST",
    accessToken,
    body: JSON.stringify({ answers, timeSpentSeconds })
  });
}
