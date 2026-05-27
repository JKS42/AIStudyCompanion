import { Button, SafeAreaView, ScrollView, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { LibraryStackParamList } from "../../../app/navigation/LibraryStack";
import { colors } from "../../../theme/colors";
import { radii, spacing } from "../../../theme/spacing";

type Props = NativeStackScreenProps<LibraryStackParamList, "QuizResult">;

export function QuizResultScreen({ navigation, route }: Props) {
  const { quizTitle, scorePercent, correctCount, total, breakdown } = route.params;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        <Text style={{ fontSize: 22, fontWeight: "800", color: colors.textPrimary }}>Quiz results</Text>
        <Text style={{ color: colors.textSecondary }}>{quizTitle}</Text>

        <View
          style={{
            backgroundColor: colors.brandPrimaryMuted,
            borderRadius: radii.lg,
            padding: spacing.xl,
            alignItems: "center",
            gap: spacing.xs
          }}
        >
          <Text style={{ fontSize: 40, fontWeight: "800", color: colors.brandPrimary }}>
            {scorePercent}%
          </Text>
          <Text style={{ color: colors.textSecondary }}>
            {correctCount} of {total} correct
          </Text>
        </View>

        <View style={{ gap: spacing.md }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: colors.textPrimary }}>Review</Text>
          {breakdown.map((item, index) => (
            <View
              key={item.questionId}
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: item.correct ? colors.brandAccent : colors.error,
                borderRadius: radii.md,
                padding: spacing.md,
                gap: spacing.xs
              }}
            >
              <Text style={{ color: colors.textPrimary, fontWeight: "600" }}>
                Question {index + 1} — {item.correct ? "Correct" : "Incorrect"}
              </Text>
              {item.explanation ? (
                <Text style={{ color: colors.textSecondary }}>{item.explanation}</Text>
              ) : null}
            </View>
          ))}
        </View>

        <Button
          color={colors.brandPrimary}
          title="Done"
          onPress={() => navigation.popToTop()}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
