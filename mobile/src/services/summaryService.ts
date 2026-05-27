import { apiFetch } from "../shared/api";
import { supabase } from "../shared/supabase";
import type { GenerateSummaryResult, Summary } from "../types/summary";

export async function listSummariesForNote(noteId: string): Promise<Summary[]> {
  const { data, error } = await supabase
    .from("summaries")
    .select("*")
    .eq("note_id", noteId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Summary[];
}

export async function generateSummary(
  noteId: string,
  accessToken: string,
  options?: { force?: boolean }
): Promise<GenerateSummaryResult> {
  return apiFetch<GenerateSummaryResult>("/api/ai/summarize", {
    method: "POST",
    accessToken,
    body: JSON.stringify({
      noteId,
      force: options?.force ?? false
    })
  });
}
