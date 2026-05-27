import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button, SafeAreaView, Text, View } from "react-native";
import { useAuth } from "../../../app/providers/AuthProvider";
import { AuthTextField } from "../../../components/ui/AuthTextField";
import { resetPasswordSchema, type ResetPasswordValues } from "../schemas";
import { colors } from "../../../theme/colors";
import { spacing } from "../../../theme/spacing";

export function ResetPasswordScreen() {
  const { resetPasswordForEmail } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: "" }
  });

  async function onSubmit(values: ResetPasswordValues) {
    setFormError(null);
    setMessage(null);
    try {
      await resetPasswordForEmail(values.email.trim());
      setMessage("If this email exists, a reset link was sent.");
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Reset failed");
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: spacing.lg, gap: spacing.md }}>
        <Text style={{ fontSize: 26, fontWeight: "800", color: colors.textPrimary }}>
          Reset password
        </Text>
        <Text style={{ color: colors.textSecondary }}>We’ll email you a reset link.</Text>

        <View style={{ marginTop: spacing.md, gap: spacing.md }}>
          <AuthTextField
            control={control}
            name="email"
            label="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
            error={errors.email?.message}
          />

          {message ? <Text style={{ color: colors.brandAccent }}>{message}</Text> : null}
          {formError ? <Text style={{ color: colors.error }}>{formError}</Text> : null}

          <Button
            color={colors.brandPrimary}
            title={isSubmitting ? "Sending..." : "Send reset email"}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
