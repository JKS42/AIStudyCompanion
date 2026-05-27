import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { generateSummary, listSummariesForNote } from "../services/summaryService";

export function useSummaries(noteId: string | undefined) {
  return useQuery({
    queryKey: ["summaries", noteId],
    queryFn: () => listSummariesForNote(noteId!),
    enabled: Boolean(noteId)
  });
}

export function useGenerateSummary(noteId: string | undefined, accessToken: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (options?: { force?: boolean }) => {
      if (!noteId || !accessToken) {
        throw new Error("You must be signed in to generate a summary.");
      }
      return generateSummary(noteId, accessToken, options);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["summaries", noteId] });
      void queryClient.invalidateQueries({ queryKey: ["notes"] });
      void queryClient.invalidateQueries({ queryKey: ["note", noteId] });
    }
  });
}
