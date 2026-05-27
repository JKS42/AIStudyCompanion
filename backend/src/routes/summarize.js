import { Router } from "express";
import { config } from "../config.js";
import { recordLatency, getLatencyStats } from "../lib/metrics.js";
import { getAdminClient } from "../lib/supabase.js";
import { requireAuth } from "../middleware/auth.js";
import { extractNoteContent } from "../services/noteContent.js";
import { generateSummary } from "../services/summarize.js";

export const summarizeRouter = Router();

summarizeRouter.get("/metrics", (_req, res) => {
  res.json({ ok: true, latency: getLatencyStats() });
});

summarizeRouter.post("/summarize", requireAuth, async (req, res) => {
  const started = Date.now();
  const { noteId, force } = req.body ?? {};

  if (!noteId || typeof noteId !== "string") {
    return res.status(400).json({ error: "noteId is required." });
  }

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
      return res.status(400).json({
        error: "This note is not ready for summarization yet."
      });
    }

    if (!force) {
      const { data: existing } = await supabase
        .from("summaries")
        .select("*")
        .eq("note_id", noteId)
        .eq("user_id", req.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing) {
        recordLatency(Date.now() - started);
        return res.json({
          summary: existing,
          cached: true,
          latencyMs: Date.now() - started
        });
      }
    }

    const { text, extractionMethod } = await extractNoteContent(note, note.uploaded_files ?? []);
    const generated = await generateSummary(text, {
      title: note.title,
      subject: note.subject ?? undefined
    });

    const { data: saved, error: saveError } = await supabase
      .from("summaries")
      .insert({
        note_id: note.id,
        user_id: req.user.id,
        summary_text: generated.summaryText,
        key_points: generated.keyPoints,
        prompt_version: generated.promptVersion,
        model_used: generated.modelUsed,
        token_usage_input: generated.tokenUsageInput,
        token_usage_output: generated.tokenUsageOutput
      })
      .select("*")
      .single();

    if (saveError) {
      return res.status(500).json({ error: saveError.message });
    }

    if (note.status === "uploaded") {
      await supabase.from("notes").update({ status: "ready" }).eq("id", note.id);
    }

    const latencyMs = Date.now() - started;
    recordLatency(latencyMs);

    return res.json({
      summary: saved,
      cached: false,
      extractionMethod,
      latencyMs
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Summary generation failed.";
    const status = message.includes("timed out") ? 504 : 500;
    return res.status(status).json({ error: message });
  }
});
