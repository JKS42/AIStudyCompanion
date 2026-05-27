import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Button,
  Pressable,
  SafeAreaView,
  Text,
  View
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useDueFlashcards, useRecordFlashcardReview } from "../../../hooks/useFlashcards";
import type { LibraryStackParamList } from "../../../app/navigation/LibraryStack";
import type { ReviewResult } from "../../../types/flashcard";
import { colors } from "../../../theme/colors";
import { radii, spacing } from "../../../theme/spacing";

type Props = NativeStackScreenProps<LibraryStackParamList, "FlashcardReview">;

export function FlashcardReviewScreen({ navigation, route }: Props) {
  const { noteId } = route.params;
  const { data: dueCards = [], isLoading, refetch } = useDueFlashcards(noteId);
  const reviewMutation = useRecordFlashcardReview(noteId);

  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const current = dueCards[index];
  const remaining = dueCards.length - index;

  const progressLabel = useMemo(() => {
    if (!dueCards.length) return "No cards due";
    return `Card ${index + 1} of ${dueCards.length} · ${remaining} remaining`;
  }, [dueCards.length, index, remaining]);

  async function handleReview(result: ReviewResult) {
    if (!current) return;

    await reviewMutation.mutateAsync({ cardId: current.id, result });
    setRevealed(false);

    if (index >= dueCards.length - 1) {
      await refetch();
      navigation.goBack();
      return;
    }

    setIndex((value) => value + 1);
  }

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.brandPrimary} style={{ marginTop: spacing.xl }} />
      </SafeAreaView>
    );
  }

  if (!dueCards.length) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, padding: spacing.lg }}>
        <Text style={{ fontSize: 20, fontWeight: "700", color: colors.textPrimary }}>All caught up!</Text>
        <Text style={{ marginTop: spacing.sm, color: colors.textSecondary }}>
          No flashcards are due right now. Check back later.
        </Text>
        <View style={{ marginTop: spacing.lg }}>
          <Button title="Back" onPress={() => navigation.goBack()} color={colors.brandPrimary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!current) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, padding: spacing.lg }}>
        <Text style={{ color: colors.textSecondary }}>Session complete.</Text>
        <Button title="Back" onPress={() => navigation.goBack()} color={colors.brandPrimary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, padding: spacing.lg, gap: spacing.lg }}>
        <Text style={{ color: colors.textSecondary }}>{progressLabel}</Text>

        <Pressable
          onPress={() => setRevealed((value) => !value)}
          style={{
            flex: 1,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.lg,
            padding: spacing.xl,
            justifyContent: "center"
          }}
        >
          <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: spacing.sm }}>
            {revealed ? "Back" : "Front"} · tap to flip
          </Text>
          <Text style={{ fontSize: 20, fontWeight: "700", color: colors.textPrimary, lineHeight: 28 }}>
            {revealed ? current.back_text : current.front_text}
          </Text>
        </Pressable>

        {revealed ? (
          <View style={{ gap: spacing.sm }}>
            <Text style={{ color: colors.textPrimary, fontWeight: "600" }}>How well did you know it?</Text>
            <View style={{ flexDirection: "row", gap: spacing.sm }}>
              <ReviewButton label="Hard" onPress={() => void handleReview("hard")} disabled={reviewMutation.isPending} />
              <ReviewButton
                label="Medium"
                onPress={() => void handleReview("medium")}
                disabled={reviewMutation.isPending}
              />
              <ReviewButton label="Easy" onPress={() => void handleReview("easy")} disabled={reviewMutation.isPending} />
            </View>
          </View>
        ) : (
          <Button title="Show answer" onPress={() => setRevealed(true)} color={colors.brandPrimary} />
        )}

        {reviewMutation.error ? (
          <Text style={{ color: colors.error }}>
            {reviewMutation.error instanceof Error
              ? reviewMutation.error.message
              : "Could not save review."}
          </Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

function ReviewButton({
  label,
  onPress,
  disabled
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        flex: 1,
        padding: spacing.md,
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        alignItems: "center",
        opacity: disabled ? 0.6 : 1
      }}
    >
      <Text style={{ color: colors.textPrimary, fontWeight: "600" }}>{label}</Text>
    </Pressable>
  );
}
