export type Flashcard = {
  id: string;
  note_id: string;
  user_id: string;
  front_text: string;
  back_text: string;
  difficulty: number;
  next_review_at: string | null;
  review_count: number;
  last_result: "easy" | "medium" | "hard" | null;
  created_at: string;
  updated_at: string;
};

export type ReviewResult = "easy" | "medium" | "hard";

export type GenerateFlashcardsResult = {
  cards: Flashcard[];
  cached: boolean;
  count: number;
};
