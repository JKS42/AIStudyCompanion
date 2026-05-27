import { useMemo, useRef, useState } from "react";
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
import { useQuizForPlay, useSubmitQuiz } from "../../../hooks/useQuiz";
import type { LibraryStackParamList } from "../../../app/navigation/LibraryStack";
import type { QuizAnswerInput } from "../../../types/quiz";
import { colors } from "../../../theme/colors";
import { radii, spacing } from "../../../theme/spacing";

type Props = NativeStackScreenProps<LibraryStackParamList, "QuizPlay">;

export function QuizPlayScreen({ navigation, route }: Props) {
  const { quizId } = route.params;
  const { session } = useAuth();
  const accessToken = session?.access_token;
  const startedAt = useRef(Date.now());

  const { data: quiz, isLoading, error } = useQuizForPlay(quizId, accessToken);
  const submitMutation = useSubmitQuiz(quizId, accessToken);

  const [answers, setAnswers] = useState<Record<string, number>>({});

  const unanswered = useMemo(() => {
    if (!quiz) return 0;
    return quiz.questions.filter((q) => answers[q.id] === undefined).length;
  }, [quiz, answers]);

  function selectAnswer(questionId: string, index: number) {
    setAnswers((prev) => ({ ...prev, [questionId]: index }));
  }

  async function handleSubmit() {
    if (!quiz) return;

    if (unanswered > 0) {
      return;
    }

    const payload: QuizAnswerInput[] = quiz.questions.map((q) => ({
      questionId: q.id,
      selectedIndex: answers[q.id]
    }));

    const timeSpentSeconds = Math.round((Date.now() - startedAt.current) / 1000);

    try {
      const result = await submitMutation.mutateAsync({
        answers: payload,
        timeSpentSeconds
      });

      navigation.replace("QuizResult", {
        quizId,
        quizTitle: quiz.title,
        scorePercent: result.result.scorePercent,
        correctCount: result.result.correctCount,
        total: result.result.total,
        breakdown: result.result.breakdown
      });
    } catch {
      // surfaced via submitMutation.error
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.brandPrimary} style={{ marginTop: spacing.xl }} />
      </SafeAreaView>
    );
  }

  if (error || !quiz) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, padding: spacing.lg }}>
        <Text style={{ color: colors.error }}>
          {error instanceof Error ? error.message : "Could not load quiz."}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        <Text style={{ fontSize: 20, fontWeight: "800", color: colors.textPrimary }}>{quiz.title}</Text>
        <Text style={{ color: colors.textSecondary }}>
          Answer all {quiz.questions.length} questions, then submit for scoring.
        </Text>

        {quiz.questions.map((question, index) => (
          <View
            key={question.id}
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radii.lg,
              padding: spacing.lg,
              gap: spacing.sm
            }}
          >
            <Text style={{ color: colors.textPrimary, fontWeight: "700" }}>
              {index + 1}. {question.prompt}
            </Text>
            {question.options.map((option, optionIndex) => {
              const selected = answers[question.id] === optionIndex;
              return (
                <Pressable
                  key={`${question.id}-${optionIndex}`}
                  onPress={() => selectAnswer(question.id, optionIndex)}
                  style={{
                    padding: spacing.md,
                    borderRadius: radii.md,
                    borderWidth: 1,
                    borderColor: selected ? colors.brandPrimary : colors.border,
                    backgroundColor: selected ? colors.brandPrimaryMuted : colors.background
                  }}
                >
                  <Text style={{ color: colors.textPrimary }}>{option}</Text>
                </Pressable>
              );
            })}
          </View>
        ))}

        {unanswered > 0 ? (
          <Text style={{ color: colors.textSecondary }}>{unanswered} question(s) remaining</Text>
        ) : null}

        {submitMutation.error ? (
          <Text style={{ color: colors.error }}>
            {submitMutation.error instanceof Error
              ? submitMutation.error.message
              : "Could not submit quiz."}
          </Text>
        ) : null}

        <Button
          color={colors.brandPrimary}
          title={submitMutation.isPending ? "Scoring…" : "Submit answers"}
          onPress={() => void handleSubmit()}
          disabled={submitMutation.isPending || unanswered > 0}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
