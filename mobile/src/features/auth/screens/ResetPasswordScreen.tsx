import { useState } from "react";
import { Button, SafeAreaView, Text, TextInput, View } from "react-native";
import { useAuth } from "../../../app/providers/AuthProvider";
import { colors } from "../../../theme/colors";
import { radii, spacing } from "../../../theme/spacing";

export function ResetPasswordScreen() {
  const { resetPasswordForEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onReset() {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await resetPasswordForEmail(email.trim());
      setMessage("If this email exists, a reset link was sent.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reset failed");
    } finally {
      setLoading(false);
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
          <View style={{ gap: 6 }}>
            <Text style={{ color: colors.textPrimary }}>Email</Text>
            <TextInput
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={colors.textMuted}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                padding: spacing.md,
                borderRadius: radii.md,
                backgroundColor: colors.inputBackground,
                color: colors.textPrimary
              }}
            />
          </View>

          {message ? <Text style={{ color: colors.brandAccent }}>{message}</Text> : null}
          {error ? <Text style={{ color: colors.error }}>{error}</Text> : null}

          <Button
            color={colors.brandPrimary}
            title={loading ? "Sending..." : "Send reset email"}
            onPress={onReset}
            disabled={loading}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

