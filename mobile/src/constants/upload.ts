export const UPLOAD_BUCKET = "uploads";

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024; // 25 MB

export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "audio/mpeg",
  "audio/wav",
  "audio/x-wav",
  "audio/mp4"
] as const;

export const MIME_TO_SOURCE = {
  "application/pdf": "pdf",
  "image/jpeg": "image",
  "image/png": "image",
  "image/webp": "image",
  "audio/mpeg": "voice",
  "audio/wav": "voice",
  "audio/x-wav": "voice",
  "audio/mp4": "voice"
} as const;

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateUploadFile(mimeType: string, size: number): string | null {
  if (size <= 0) return "File appears to be empty.";
  if (size > MAX_UPLOAD_BYTES) {
    return `File is too large. Maximum size is ${formatFileSize(MAX_UPLOAD_BYTES)}.`;
  }
  if (!ALLOWED_MIME_TYPES.includes(mimeType as (typeof ALLOWED_MIME_TYPES)[number])) {
    return "Unsupported file type. Use PDF, image (JPEG/PNG/WebP), or audio (MP3/WAV).";
  }
  return null;
}
