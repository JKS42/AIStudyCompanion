import { UPLOAD_BUCKET } from "../constants/upload";
import { supabase } from "../shared/supabase";
import {
  createProcessingNote,
  markNoteFailed,
  markNoteUploaded,
  type FileUploadPayload
} from "./notesService";

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

async function readFileBytes(uri: string): Promise<ArrayBuffer> {
  const response = await fetch(uri);
  if (!response.ok) throw new Error("Could not read the selected file.");
  return response.arrayBuffer();
}

export async function uploadNoteFile(
  payload: FileUploadPayload,
  options?: {
    onProgress?: (percent: number) => void;
    isCancelled?: () => boolean;
  }
): Promise<{ noteId: string }> {
  const { userId, title, subject, file } = payload;

  if (options?.isCancelled?.()) {
    throw new Error("Upload cancelled.");
  }

  options?.onProgress?.(5);

  const note = await createProcessingNote(userId, {
    title,
    subject,
    sourceType: file.sourceType
  });

  const storagePath = `${userId}/${note.id}/${sanitizeFileName(file.name)}`;

  try {
    if (options?.isCancelled?.()) {
      throw new Error("Upload cancelled.");
    }

    options?.onProgress?.(20);

    const bytes = await readFileBytes(file.uri);

    if (options?.isCancelled?.()) {
      throw new Error("Upload cancelled.");
    }

    options?.onProgress?.(45);

    const { error: storageError } = await supabase.storage
      .from(UPLOAD_BUCKET)
      .upload(storagePath, bytes, {
        contentType: file.mimeType,
        upsert: false
      });

    if (storageError) {
      throw new Error(storageError.message);
    }

    options?.onProgress?.(75);

    const { error: fileRowError } = await supabase.from("uploaded_files").insert({
      note_id: note.id,
      user_id: userId,
      storage_bucket: UPLOAD_BUCKET,
      storage_path: storagePath,
      file_type: file.mimeType,
      file_size_bytes: file.size
    });

    if (fileRowError) {
      await supabase.storage.from(UPLOAD_BUCKET).remove([storagePath]);
      throw new Error(fileRowError.message);
    }

    await markNoteUploaded(note.id);
    options?.onProgress?.(100);

    return { noteId: note.id };
  } catch (error) {
    await markNoteFailed(note.id).catch(() => undefined);
    throw error instanceof Error ? error : new Error("Upload failed.");
  }
}

export async function getSignedFileUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(UPLOAD_BUCKET)
    .createSignedUrl(storagePath, 60 * 60);

  if (error) throw error;
  return data.signedUrl;
}
