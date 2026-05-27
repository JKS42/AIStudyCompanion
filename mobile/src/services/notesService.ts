import { supabase } from "../shared/supabase";
import type { CreateFileNoteInput, CreateTextNoteInput, Note, NoteWithFiles } from "../types/note";

export async function listNotes(userId: string): Promise<NoteWithFiles[]> {
  const { data, error } = await supabase
    .from("notes")
    .select("*, uploaded_files(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as NoteWithFiles[];
}

export async function getNote(noteId: string): Promise<NoteWithFiles> {
  const { data, error } = await supabase
    .from("notes")
    .select("*, uploaded_files(*)")
    .eq("id", noteId)
    .single();

  if (error) throw error;
  return data as NoteWithFiles;
}

export async function createTextNote(userId: string, input: CreateTextNoteInput): Promise<Note> {
  const trimmed = input.rawText.trim();
  if (!trimmed) throw new Error("Note text cannot be empty.");

  const { data, error } = await supabase
    .from("notes")
    .insert({
      user_id: userId,
      title: input.title.trim(),
      subject: input.subject?.trim() || null,
      source_type: "typed",
      raw_text: trimmed,
      status: "ready"
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as Note;
}

export async function createProcessingNote(
  userId: string,
  input: { title: string; subject?: string; sourceType: "pdf" | "image" | "voice" }
): Promise<Note> {
  const { data, error } = await supabase
    .from("notes")
    .insert({
      user_id: userId,
      title: input.title.trim(),
      subject: input.subject?.trim() || null,
      source_type: input.sourceType,
      status: "processing"
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as Note;
}

export async function markNoteFailed(noteId: string): Promise<void> {
  const { error } = await supabase.from("notes").update({ status: "failed" }).eq("id", noteId);
  if (error) throw error;
}

export async function markNoteUploaded(noteId: string): Promise<void> {
  const { error } = await supabase.from("notes").update({ status: "uploaded" }).eq("id", noteId);
  if (error) throw error;
}

export async function deleteNote(noteId: string): Promise<void> {
  const { error } = await supabase.from("notes").delete().eq("id", noteId);
  if (error) throw error;
}

export type FileUploadPayload = CreateFileNoteInput & { userId: string };
