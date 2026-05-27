import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  countDueFlashcards,
  generateFlashcards,
  listDueFlashcardsForNote,
  listFlashcardsForNote,
  recordFlashcardReview
} from "../services/flashcardService";
import type { ReviewResult } from "../types/flashcard";

export function useFlashcards(noteId: string | undefined) {
  return useQuery({
    queryKey: ["flashcards", noteId],
    queryFn: () => listFlashcardsForNote(noteId!),
    enabled: Boolean(noteId)
  });
}

export function useDueFlashcards(noteId: string | undefined) {
  return useQuery({
    queryKey: ["flashcardsDue", noteId],
    queryFn: () => listDueFlashcardsForNote(noteId!),
    enabled: Boolean(noteId)
  });
}

export function useDueFlashcardCount(noteId: string | undefined) {
  const query = useFlashcards(noteId);
  const dueCount = query.data ? countDueFlashcards(query.data) : 0;
  return { ...query, dueCount };
}

export function useGenerateFlashcards(noteId: string | undefined, accessToken: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (options?: { count?: number; force?: boolean }) => {
      if (!noteId || !accessToken) throw new Error("You must be signed in.");
      return generateFlashcards(noteId, accessToken, options);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["flashcards", noteId] });
      void queryClient.invalidateQueries({ queryKey: ["flashcardsDue", noteId] });
    }
  });
}

export function useRecordFlashcardReview(noteId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { cardId: string; result: ReviewResult }) =>
      recordFlashcardReview(input.cardId, input.result),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["flashcards", noteId] });
      void queryClient.invalidateQueries({ queryKey: ["flashcardsDue", noteId] });
    }
  });
}
