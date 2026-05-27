import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { useProfile } from "../../../app/providers/ProfileProvider";
import { onboardingSchema, type OnboardingValues } from "../../auth/schemas";
import { AuthTextField } from "../../../components/ui/AuthTextField";
import type { EducationLevel } from "../../../types/profile";
import { colors } from "../../../theme/colors";
import { radii, spacing } from "../../../theme/spacing";

const educationOptions: { value: EducationLevel; label: string }[] = [
  { value: "high_school", label: "High school" },
  { value: "undergraduate", label: "Undergraduate" },
  { value: "graduate", label: "Graduate" },
  { value: "self_learner", label: "Self-learner" },
  { value: "other", label: "Other" }
];

export function OnboardingScreen() {
  const { profile, finishOnboarding } = useProfile();
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      fullName: profile?.full_name ?? "",
      educationLevel: profile?.education_level ?? "undergraduate"
    }
  });

  const selectedLevel = useWatch({ control, name: "educationLevel" });

  useEffect(() => {
    if (profile?.full_name) {
      setValue("fullName", profile.full_name);
    }
    if (profile?.education_level) {
      setValue("educationLevel", profile.education_level);
    }
  }, [profile, setValue]);

  async function onSubmit(values: OnboardingValues) {
    await finishOnboarding({
      fullName: values.fullName,
      educationLevel: values.educationLevel
    });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        <Text style={{ fontSize: 28, fontWeight: "800", color: colors.textPrimary }}>
          Set up your profile
        </Text>
        <Text style={{ color: colors.textSecondary }}>
          Tell us a bit about yourself so we can personalize your study experience.
        </Text>

        <View style={{ marginTop: spacing.md, gap: spacing.lg }}>
          <AuthTextField
            control={control}
            name="fullName"
            label="Full name"
            placeholder="Jane Doe"
            error={errors.fullName?.message}
          />

          <View style={{ gap: spacing.sm }}>
            <Text style={{ color: colors.textPrimary, fontWeight: "600" }}>Education level</Text>
            <View style={{ gap: spacing.sm }}>
              {educationOptions.map((option) => {
                const selected = selectedLevel === option.value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => setValue("educationLevel", option.value, { shouldValidate: true })}
                    style={{
                      borderWidth: 1,
                      borderColor: selected ? colors.brandPrimary : colors.border,
                      backgroundColor: selected ? colors.brandPrimaryMuted : colors.surface,
                      padding: spacing.md,
                      borderRadius: radii.md
                    }}
                  >
                    <Text style={{ color: colors.textPrimary, fontWeight: selected ? "700" : "500" }}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {errors.educationLevel ? (
              <Text style={{ color: colors.error, fontSize: 13 }}>{errors.educationLevel.message}</Text>
            ) : null}
          </View>

          <Button
            color={colors.brandPrimary}
            title={isSubmitting ? "Saving..." : "Continue to dashboard"}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
