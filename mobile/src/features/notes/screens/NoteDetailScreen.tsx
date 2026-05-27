import { useState } from "react";
import {
  ActivityIndicator,
  Button,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAuth } from "../../../app/providers/AuthProvider";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import {
  useDueFlashcardCount,
  useFlashcards,
  useGenerateFlashcards
} from "../../../hooks/useFlashcards";
import { useNote } from "../../../hooks/useNotes";
import { useGenerateQuiz, useQuizzes } from "../../../hooks/useQuiz";
import { useGenerateSummary, useSummaries } from "../../../hooks/useSummaries";
import type { Summary } from "../../../types/summary";
import type { LibraryStackParamList } from "../../../app/navigation/LibraryStack";
import { colors } from "../../../theme/colors";
import { radii, spacing } from "../../../theme/spacing";

const DIFFICULTY_OPTIONS = [
  { level: 1, label: "Easy" },
  { level: 2, label: "Medium" },
  { level: 3, label: "Hard" }
] as const;

type Props = NativeStackScreenProps<LibraryStackParamList, "NoteDetail">;

export function NoteDetailScreen({ navigation, route }: Props) {
  const { noteId } = route.params;
  const { session } = useAuth();
  const accessToken = session?.access_token;

  const { data: note, isLoading: noteLoading, error: noteError } = useNote(noteId);
  const { data: summaries = [], isLoading: summariesLoading } = useSummaries(noteId);
  const generateMutation = useGenerateSummary(noteId, accessToken);
  const { data: quizzes = [] } = useQuizzes(noteId);
  const generateQuizMutation = useGenerateQuiz(noteId, accessToken);
  const generateFlashcardsMutation = useGenerateFlashcards(noteId, accessToken);
  const { data: flashcards = [] } = useFlashcards(noteId);
  const { dueCount } = useDueFlashcardCount(noteId);

  const [difficultyLevel, setDifficultyLevel] = useState<1 | 2 | 3>(2);

  const latestSummary = summaries[0];
  const canStudy = note && note.status !== "failed" && note.status !== "processing";
  const canSummarize = canStudy;
  const isGenerating = generateMutation.isPending;

  const quizForDifficulty = quizzes.find((q) => q.difficulty_level === difficultyLevel);

  async function handleGenerate(force = false) {
    try {
      await generateMutation.mutateAsync({ force });
    } catch {
      // Error surfaced via generateMutation.error
    }
  }

  if (noteLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.brandPrimary} style={{ marginTop: spacing.xl }} />
      </SafeAreaView>
    );
  }

  if (noteError || !note) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, padding: spacing.lg }}>
        <Text style={{ color: colors.error }}>
          {noteError instanceof Error ? noteError.message : "Could not load note."}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        <View style={{ gap: spacing.sm }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.sm }}>
            <Text
              style={{ flex: 1, fontSize: 22, fontWeight: "800", color: colors.textPrimary }}
              numberOfLines={2}
            >
              {note.title}
            </Text>
            <StatusBadge status={note.status} />
          </View>
          {note.subject ? (
            <Text style={{ color: colors.textSecondary }}>{note.subject}</Text>
          ) : null}
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>
            {note.source_type} · {new Date(note.created_at).toLocaleString()}
          </Text>
        </View>

        {note.raw_text ? (
          <View
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radii.md,
              padding: spacing.md,
              gap: spacing.xs
            }}
          >
            <Text style={{ color: colors.textPrimary, fontWeight: "600" }}>Source preview</Text>
            <Text style={{ color: colors.textSecondary }} numberOfLines={6}>
              {note.raw_text}
            </Text>
          </View>
        ) : null}

        <View style={{ gap: spacing.sm }}>
          <Text style={{ fontSize: 18, fontWeight: "700", color: colors.textPrimary }}>
            AI Summary
          </Text>
          <Text style={{ color: colors.textSecondary }}>
            Generate a structured summary and key points from your study material.
          </Text>

          {canSummarize ? (
            <View style={{ flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" }}>
              <Button
                color={colors.brandPrimary}
                title={isGenerating ? "Generating…" : latestSummary ? "Regenerate" : "Generate summary"}
                onPress={() => void handleGenerate(Boolean(latestSummary))}
                disabled={isGenerating}
              />
            </View>
          ) : (
            <Text style={{ color: colors.textSecondary }}>
              This note is not ready for summarization yet.
            </Text>
          )}

          {isGenerating ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
              <ActivityIndicator color={colors.brandPrimary} />
              <Text style={{ color: colors.textSecondary }}>This may take up to 45 seconds…</Text>
            </View>
          ) : null}

          {generateMutation.error ? (
            <Text style={{ color: colors.error }}>
              {generateMutation.error instanceof Error
                ? generateMutation.error.message
                : "Summary generation failed."}
            </Text>
          ) : null}
        </View>

        {summariesLoading ? (
          <ActivityIndicator color={colors.brandPrimary} />
        ) : latestSummary ? (
          <SummaryCard summary={latestSummary} />
        ) : (
          <Text style={{ color: colors.textMuted }}>No summary yet. Tap Generate summary above.</Text>
        )}

        {summaries.length > 1 ? (
          <View style={{ gap: spacing.sm }}>
            <Text style={{ color: colors.textPrimary, fontWeight: "600" }}>Previous versions</Text>
            {summaries.slice(1).map((summary) => (
              <Pressable key={summary.id} onPress={() => undefined}>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                  {new Date(summary.created_at).toLocaleString()} · {summary.model_used ?? "unknown"}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <View style={{ gap: spacing.sm }}>
          <Text style={{ fontSize: 18, fontWeight: "700", color: colors.textPrimary }}>
            Quiz
          </Text>
          <Text style={{ color: colors.textSecondary }}>
            Multiple-choice quiz with server-side scoring.
          </Text>

          {canStudy ? (
            <>
              <View style={{ flexDirection: "row", gap: spacing.sm }}>
                {DIFFICULTY_OPTIONS.map((option) => {
                  const selected = difficultyLevel === option.level;
                  return (
                    <Pressable
                      key={option.level}
                      onPress={() => setDifficultyLevel(option.level)}
                      style={{
                        flex: 1,
                        padding: spacing.sm,
                        borderRadius: radii.md,
                        borderWidth: 1,
                        borderColor: selected ? colors.brandPrimary : colors.border,
                        backgroundColor: selected ? colors.brandPrimaryMuted : colors.surface,
                        alignItems: "center"
                      }}
                    >
                      <Text style={{ color: colors.textPrimary, fontWeight: selected ? "700" : "500" }}>
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Button
                color={colors.brandPrimary}
                title={
                  generateQuizMutation.isPending
                    ? "Generating…"
                    : quizForDifficulty
                      ? "Regenerate quiz"
                      : "Generate quiz"
                }
                disabled={generateQuizMutation.isPending}
                onPress={() =>
                  void generateQuizMutation
                    .mutateAsync({ difficultyLevel, force: Boolean(quizForDifficulty) })
                    .catch(() => undefined)
                }
              />

              {quizForDifficulty ? (
                <Button
                  color={colors.brandAccent}
                  title="Start quiz"
                  onPress={() => navigation.navigate("QuizPlay", { quizId: quizForDifficulty.id })}
                />
              ) : null}
            </>
          ) : (
            <Text style={{ color: colors.textSecondary }}>Note must be ready before generating a quiz.</Text>
          )}

          {generateQuizMutation.error ? (
            <Text style={{ color: colors.error }}>
              {generateQuizMutation.error instanceof Error
                ? generateQuizMutation.error.message
                : "Quiz generation failed."}
            </Text>
          ) : null}
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text style={{ fontSize: 18, fontWeight: "700", color: colors.textPrimary }}>
            Flashcards
          </Text>
          <Text style={{ color: colors.textSecondary }}>
            Spaced review queue — Hard (+4h), Medium (+1d), Easy (+3d).
          </Text>

          {canStudy ? (
            <>
              <Button
                color={colors.brandPrimary}
                title={generateFlashcardsMutation.isPending ? "Generating…" : "Generate flashcards"}
                disabled={generateFlashcardsMutation.isPending}
                onPress={() =>
                  void generateFlashcardsMutation
                    .mutateAsync({ force: false })
                    .catch(() => undefined)
                }
              />
              {flashcards.length > 0 ? (
                <Button
                  color={colors.brandPrimary}
                  title="Regenerate flashcards"
                  disabled={generateFlashcardsMutation.isPending}
                  onPress={() =>
                    void generateFlashcardsMutation.mutateAsync({ force: true }).catch(() => undefined)
                  }
                />
              ) : null}
              <Button
                color={colors.brandAccent}
                title={`Review due (${dueCount})`}
                disabled={dueCount === 0}
                onPress={() => navigation.navigate("FlashcardReview", { noteId })}
              />
            </>
          ) : (
            <Text style={{ color: colors.textSecondary }}>
              Note must be ready before generating flashcards.
            </Text>
          )}

          {generateFlashcardsMutation.error ? (
            <Text style={{ color: colors.error }}>
              {generateFlashcardsMutation.error instanceof Error
                ? generateFlashcardsMutation.error.message
                : "Flashcard generation failed."}
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryCard({ summary }: { summary: Summary }) {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.lg,
        padding: spacing.lg,
        gap: spacing.md
      }}
    >
      <Text style={{ color: colors.textPrimary, lineHeight: 22 }}>{summary.summary_text}</Text>

      {summary.key_points?.length ? (
        <View style={{ gap: spacing.xs }}>
          <Text style={{ color: colors.textPrimary, fontWeight: "700" }}>Key points</Text>
          {summary.key_points.map((point, index) => (
            <Text key={`${summary.id}-${index}`} style={{ color: colors.textSecondary, lineHeight: 20 }}>
              • {point}
            </Text>
          ))}
        </View>
      ) : null}

      <Text style={{ color: colors.textMuted, fontSize: 12 }}>
        {summary.model_used ?? "model unknown"} · prompt {summary.prompt_version}
        {summary.token_usage_input != null
          ? ` · ${summary.token_usage_input + (summary.token_usage_output ?? 0)} tokens`
          : ""}
      </Text>
    </View>
  );
}
