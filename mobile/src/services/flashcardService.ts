import { apiFetch } from "../shared/api";
import { supabase } from "../shared/supabase";
import type { Flashcard, GenerateFlashcardsResult, ReviewResult } from "../types/flashcard";

function nextReviewDate(result: ReviewResult): string {
  const now = Date.now();
  const offsets = {
    easy: 3 * 24 * 60 * 60 * 1000,
    medium: 24 * 60 * 60 * 1000,
    hard: 4 * 60 * 60 * 1000
  };
  return new Date(now + offsets[result]).toISOString();
}

export async function listFlashcardsForNote(noteId: string): Promise<Flashcard[]> {
  const { data, error } = await supabase
    .from("flashcards")
    .select("*")
    .eq("note_id", noteId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Flashcard[];
}

export function countDueFlashcards(cards: Flashcard[]): number {
  const now = Date.now();
  return cards.filter((card) => {
    if (!card.next_review_at) return true;
    return new Date(card.next_review_at).getTime() <= now;
  }).length;
}

export async function listDueFlashcardsForNote(noteId: string): Promise<Flashcard[]> {
  const cards = await listFlashcardsForNote(noteId);
  const now = Date.now();
  return cards.filter((card) => {
    if (!card.next_review_at) return true;
    return new Date(card.next_review_at).getTime() <= now;
  });
}

export async function generateFlashcards(
  noteId: string,
  accessToken: string,
  options?: { count?: number; force?: boolean }
): Promise<GenerateFlashcardsResult> {
  return apiFetch<GenerateFlashcardsResult>("/api/ai/flashcards/generate", {
    method: "POST",
    accessToken,
    body: JSON.stringify({
      noteId,
      count: options?.count ?? 10,
      force: options?.force ?? false
    })
  });
}

export async function recordFlashcardReview(
  cardId: string,
  result: ReviewResult
): Promise<Flashcard> {
  const { data: existing, error: fetchError } = await supabase
    .from("flashcards")
    .select("review_count")
    .eq("id", cardId)
    .single();

  if (fetchError) throw fetchError;

  const { data, error } = await supabase
    .from("flashcards")
    .update({
      last_result: result,
      review_count: (existing?.review_count ?? 0) + 1,
      next_review_at: nextReviewDate(result)
    })
    .eq("id", cardId)
    .select("*")
    .single();

  if (error) throw error;
  return data as Flashcard;
}
