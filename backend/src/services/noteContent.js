import { createRequire } from "module";
import { getAdminClient } from "../lib/supabase.js";

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

const MIN_EXTRACTED_CHARS = 40;

async function downloadFile(storageBucket, storagePath) {
  const supabase = getAdminClient();
  const { data, error } = await supabase.storage.from(storageBucket).download(storagePath);
  if (error || !data) {
    throw new Error(error?.message ?? "Could not download file from storage.");
  }
  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function extractPdfText(buffer) {
  const parsed = await pdf(buffer);
  return (parsed.text ?? "").trim();
}

export async function extractNoteContent(note, uploadedFiles = []) {
  if (note.source_type === "typed") {
    const text = (note.raw_text ?? "").trim();
    if (text.length < MIN_EXTRACTED_CHARS) {
      throw new Error("Note text is too short to summarize. Add more content.");
    }
    return { text, extractionMethod: "typed" };
  }

  const file = uploadedFiles[0];
  if (!file) {
    throw new Error("No uploaded file found for this note.");
  }

  if (note.source_type === "pdf" || file.file_type === "application/pdf") {
    const buffer = await downloadFile(file.storage_bucket, file.storage_path);
    const text = await extractPdfText(buffer);
    if (text.length < MIN_EXTRACTED_CHARS) {
      throw new Error(
        "Could not extract enough text from this PDF. Try a text-based PDF or paste notes as typed text."
      );
    }
    return { text, extractionMethod: "pdf-parse" };
  }

  if (file.file_type === "text/plain") {
    const buffer = await downloadFile(file.storage_bucket, file.storage_path);
    const text = buffer.toString("utf8").trim();
    if (text.length < MIN_EXTRACTED_CHARS) {
      throw new Error("Text file is too short to summarize.");
    }
    return { text, extractionMethod: "plain-text" };
  }

  throw new Error(
    "Image and audio summarization requires transcription (coming soon). Use typed notes or a text-based PDF for now."
  );
}

export function truncateText(text, maxChars) {
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars)}\n\n[Content truncated for summarization]`;
}
