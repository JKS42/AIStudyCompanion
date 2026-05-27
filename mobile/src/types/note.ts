export type NoteSourceType = "typed" | "pdf" | "image" | "voice";
export type NoteStatus = "uploaded" | "processing" | "ready" | "failed";

export type Note = {
  id: string;
  user_id: string;
  title: string;
  subject: string | null;
  tags: string[];
  source_type: NoteSourceType;
  raw_text: string | null;
  status: NoteStatus;
  created_at: string;
  updated_at: string;
};

export type UploadedFile = {
  id: string;
  note_id: string;
  user_id: string;
  storage_bucket: string;
  storage_path: string;
  file_url: string | null;
  file_type: string;
  file_size_bytes: number;
  checksum: string | null;
  ocr_processed: boolean;
  created_at: string;
};

export type NoteWithFiles = Note & {
  uploaded_files: UploadedFile[];
};

export type PickedUpload = {
  uri: string;
  name: string;
  mimeType: string;
  size: number;
  sourceType: "pdf" | "image" | "voice";
};

export type CreateTextNoteInput = {
  title: string;
  subject?: string;
  rawText: string;
};

export type CreateFileNoteInput = {
  title: string;
  subject?: string;
  file: PickedUpload;
};
