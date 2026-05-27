import { Router } from "express";
import { getAdminClient } from "../lib/supabase.js";
import { requireAuth } from "../middleware/auth.js";
import { generateFlashcards } from "../services/flashcardGenerate.js";
import { resolveStudyContent } from "../services/studyContent.js";

export const flashcardsRouter = Router();

flashcardsRouter.post("/generate", requireAuth, async (req, res) => {
  const { noteId, count = 10, force } = req.body ?? {};

  if (!noteId || typeof noteId !== "string") {
    return res.status(400).json({ error: "noteId is required." });
  }

  const cardCount = Math.min(20, Math.max(3, Number(count) || 10));

  try {
    const supabase = getAdminClient();
    const { data: note, error: noteError } = await supabase
      .from("notes")
      .select("*, uploaded_files(*)")
      .eq("id", noteId)
      .eq("user_id", req.user.id)
      .single();

    if (noteError || !note) {
      return res.status(404).json({ error: "Note not found." });
    }

    if (note.status === "failed" || note.status === "processing") {
      return res.status(400).json({ error: "This note is not ready for flashcards yet." });
    }

    const { data: existingCards } = await supabase
      .from("flashcards")
      .select("id")
      .eq("note_id", noteId)
      .eq("user_id", req.user.id);

    if (existingCards?.length && !force) {
      const { data: cards } = await supabase
        .from("flashcards")
        .select("*")
        .eq("note_id", noteId)
        .eq("user_id", req.user.id)
        .order("created_at", { ascending: true });

      return res.json({ cards: cards ?? [], cached: true, count: cards?.length ?? 0 });
    }

    if (force && existingCards?.length) {
      await supabase.from("flashcards").delete().eq("note_id", noteId).eq("user_id", req.user.id);
    }

    const { text, extractionMethod } = await resolveStudyContent(supabase, note);
    const generated = await generateFlashcards(text, {
      title: note.title,
      subject: note.subject ?? undefined,
      count: cardCount
    });

    const rows = generated.cards.map((card) => ({
      note_id: note.id,
      user_id: req.user.id,
      front_text: card.front,
      back_text: card.back,
      difficulty: 3,
      next_review_at: new Date().toISOString()
    }));

    const { data: saved, error: saveError } = await supabase
      .from("flashcards")
      .insert(rows)
      .select("*");

    if (saveError) {
      return res.status(500).json({ error: saveError.message });
    }

    return res.json({
      cards: saved ?? [],
      cached: false,
      count: saved?.length ?? 0,
      extractionMethod,
      modelUsed: generated.modelUsed,
      promptVersion: generated.promptVersion
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Flashcard generation failed.";
    return res.status(500).json({ error: message });
  }
});
