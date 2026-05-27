import { extractNoteContent, truncateText } from "./noteContent.js";
import { config } from "../config.js";

export async function resolveStudyContent(supabase, note) {
  const { data: summary } = await supabase
    .from("summaries")
    .select("summary_text, key_points")
    .eq("note_id", note.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (summary?.summary_text) {
    const points = Array.isArray(summary.key_points)
      ? summary.key_points.map((p) => `- ${p}`).join("\n")
      : "";
    const text = points
      ? `${summary.summary_text}\n\nKey points:\n${points}`
      : summary.summary_text;
    return { text: truncateText(text, config.summaryMaxInputChars), extractionMethod: "summary" };
  }

  const extracted = await extractNoteContent(note, note.uploaded_files ?? []);
  return {
    text: truncateText(extracted.text, config.summaryMaxInputChars),
    extractionMethod: extracted.extractionMethod
  };
}
