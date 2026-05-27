import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchQuizForPlay,
  generateQuiz,
  listAttemptsForQuiz,
  listQuizzesForNote,
  submitQuizAttempt
} from "../services/quizService";
import type { QuizAnswerInput } from "../types/quiz";

export function useQuizzes(noteId: string | undefined) {
  return useQuery({
    queryKey: ["quizzes", noteId],
    queryFn: () => listQuizzesForNote(noteId!),
    enabled: Boolean(noteId)
  });
}

export function useQuizAttempts(quizId: string | undefined) {
  return useQuery({
    queryKey: ["quizAttempts", quizId],
    queryFn: () => listAttemptsForQuiz(quizId!),
    enabled: Boolean(quizId)
  });
}

export function useGenerateQuiz(noteId: string | undefined, accessToken: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (options: { difficultyLevel: number; force?: boolean }) => {
      if (!noteId || !accessToken) throw new Error("You must be signed in.");
      return generateQuiz(noteId, accessToken, options);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["quizzes", noteId] });
    }
  });
}

export function useQuizForPlay(quizId: string | undefined, accessToken: string | undefined) {
  return useQuery({
    queryKey: ["quizPlay", quizId],
    queryFn: () => fetchQuizForPlay(quizId!, accessToken!),
    enabled: Boolean(quizId && accessToken)
  });
}

export function useSubmitQuiz(quizId: string | undefined, accessToken: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { answers: QuizAnswerInput[]; timeSpentSeconds: number }) => {
      if (!quizId || !accessToken) throw new Error("You must be signed in.");
      return submitQuizAttempt(quizId, accessToken, input.answers, input.timeSpentSeconds);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["quizAttempts", quizId] });
    }
  });
}
