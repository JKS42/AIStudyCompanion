import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTextNote, getNote, listNotes } from "../services/notesService";
import { uploadNoteFile } from "../services/uploadService";
import type { CreateTextNoteInput, PickedUpload } from "../types/note";

export function useNotes(userId: string | undefined) {
  return useQuery({
    queryKey: ["notes", userId],
    queryFn: () => listNotes(userId!),
    enabled: Boolean(userId)
  });
}

export function useNote(noteId: string | undefined) {
  return useQuery({
    queryKey: ["note", noteId],
    queryFn: () => getNote(noteId!),
    enabled: Boolean(noteId)
  });
}

export function useCreateTextNote(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTextNoteInput) => {
      if (!userId) throw new Error("You must be signed in.");
      return createTextNote(userId, input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notes", userId] });
    }
  });
}

type UploadFileInput = {
  title: string;
  subject?: string;
  file: PickedUpload;
  onProgress?: (percent: number) => void;
  isCancelled?: () => boolean;
};

export function useUploadFileNote(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UploadFileInput) => {
      if (!userId) throw new Error("You must be signed in.");
      return uploadNoteFile(
        {
          userId,
          title: input.title,
          subject: input.subject,
          file: input.file
        },
        {
          onProgress: input.onProgress,
          isCancelled: input.isCancelled
        }
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notes", userId] });
    }
  });
}
