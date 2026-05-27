import { Router } from "express";
import { getAdminClient } from "../lib/supabase.js";
import {
  scoreQuizAttempt,
  stripQuizAnswers,
  validateQuizAnswers
} from "../lib/validators.js";
import { requireAuth } from "../middleware/auth.js";
import { generateQuizQuestions } from "../services/quizGenerate.js";
import { resolveStudyContent } from "../services/studyContent.js";

export const quizRouter = Router();

const DIFFICULTY_TITLES = {
  1: "Easy Quiz",
  2: "Medium Quiz",
  3: "Hard Quiz"
};

async function loadOwnedNote(supabase, noteId, userId) {
  const { data: note, error } = await supabase
    .from("notes")
    .select("*, uploaded_files(*)")
    .eq("id", noteId)
    .eq("user_id", userId)
    .single();

  if (error || !note) {
    return { note: null, error: "Note not found." };
  }

  if (note.status === "failed" || note.status === "processing") {
    return { note: null, error: "This note is not ready for quiz generation yet." };
  }

  return { note, error: null };
}

quizRouter.post("/generate", requireAuth, async (req, res) => {
  const { noteId, difficultyLevel = 2, force } = req.body ?? {};

  if (!noteId || typeof noteId !== "string") {
    return res.status(400).json({ error: "noteId is required." });
  }

  const level = Number(difficultyLevel);
  if (![1, 2, 3].includes(level)) {
    return res.status(400).json({ error: "difficultyLevel must be 1, 2, or 3." });
  }

  try {
    const supabase = getAdminClient();
    const { note, error: noteError } = await loadOwnedNote(supabase, noteId, req.user.id);
    if (noteError) return res.status(noteError === "Note not found." ? 404 : 400).json({ error: noteError });

    if (!force) {
      const { data: existing } = await supabase
        .from("quizzes")
        .select("*")
        .eq("note_id", noteId)
        .eq("user_id", req.user.id)
        .eq("difficulty_level", level)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing) {
        return res.json({
          quiz: existing,
          playQuiz: { ...existing, questions: stripQuizAnswers(existing.questions) },
          cached: true
        });
      }
    }

    const { text, extractionMethod } = await resolveStudyContent(supabase, note);
    const generated = await generateQuizQuestions(text, {
      title: note.title,
      subject: note.subject ?? undefined,
      difficultyLevel: level
    });

    const { data: saved, error: saveError } = await supabase
      .from("quizzes")
      .insert({
        note_id: note.id,
        user_id: req.user.id,
        title: `${note.title} — ${DIFFICULTY_TITLES[level]}`,
        difficulty_level: level,
        questions: generated.questions
      })
      .select("*")
      .single();

    if (saveError) {
      return res.status(500).json({ error: saveError.message });
    }

    return res.json({
      quiz: saved,
      playQuiz: { ...saved, questions: stripQuizAnswers(saved.questions) },
      cached: false,
      extractionMethod,
      modelUsed: generated.modelUsed,
      promptVersion: generated.promptVersion
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Quiz generation failed.";
    return res.status(500).json({ error: message });
  }
});

quizRouter.get("/:quizId/play", requireAuth, async (req, res) => {
  try {
    const supabase = getAdminClient();
    const { data: quiz, error } = await supabase
      .from("quizzes")
      .select("id, note_id, user_id, title, difficulty_level, questions, created_at")
      .eq("id", req.params.quizId)
      .eq("user_id", req.user.id)
      .single();

    if (error || !quiz) {
      return res.status(404).json({ error: "Quiz not found." });
    }

    return res.json({
      quiz: { ...quiz, questions: stripQuizAnswers(quiz.questions) }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load quiz.";
    return res.status(500).json({ error: message });
  }
});

quizRouter.post("/:quizId/attempt", requireAuth, async (req, res) => {
  const { answers, timeSpentSeconds = 0 } = req.body ?? {};

  try {
    const supabase = getAdminClient();
    const { data: quiz, error } = await supabase
      .from("quizzes")
      .select("*")
      .eq("id", req.params.quizId)
      .eq("user_id", req.user.id)
      .single();

    if (error || !quiz) {
      return res.status(404).json({ error: "Quiz not found." });
    }

    const questions = Array.isArray(quiz.questions) ? quiz.questions : [];
    validateQuizAnswers(questions, answers);

    const result = scoreQuizAttempt(questions, answers);
    const spent = Math.max(0, Number(timeSpentSeconds) || 0);

    const { data: attempt, error: attemptError } = await supabase
      .from("quiz_attempts")
      .insert({
        quiz_id: quiz.id,
        user_id: req.user.id,
        score_percent: result.scorePercent,
        time_spent_seconds: spent,
        answers: result.breakdown
      })
      .select("*")
      .single();

    if (attemptError) {
      return res.status(500).json({ error: attemptError.message });
    }

    return res.json({ attempt, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not submit quiz attempt.";
    return res.status(400).json({ error: message });
  }
});
