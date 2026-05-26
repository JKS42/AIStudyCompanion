import { useState } from "react";
import { Button, SafeAreaView, Text, TextInput, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../../app/navigation/AuthStack";
import { useAuth } from "../../../app/providers/AuthProvider";
import { colors } from "../../../theme/colors";
import { radii, spacing } from "../../../theme/spacing";

type Props = NativeStackScreenProps<AuthStackParamList, "Signup">;

export function SignupScreen({ navigation }: Props) {
  const { signUpWithEmail } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSignup() {
    setError(null);
    setLoading(true);
    try {
      await signUpWithEmail(email.trim(), password, fullName.trim());
      navigation.navigate("Login");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: spacing.lg, gap: spacing.md }}>
        <Text style={{ fontSize: 26, fontWeight: "800", color: colors.textPrimary }}>
          Create your account
        </Text>
        <Text style={{ color: colors.textSecondary }}>Start organizing your study workflow.</Text>

        <View style={{ marginTop: spacing.md, gap: spacing.md }}>
          <View style={{ gap: 6 }}>
            <Text style={{ color: colors.textPrimary }}>Full name</Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Jane Doe"
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

          <View style={{ gap: 6 }}>
            <Text style={{ color: colors.textPrimary }}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="At least 8 characters"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
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

          {error ? <Text style={{ color: colors.error }}>{error}</Text> : null}

          <Button
            color={colors.brandPrimary}
            title={loading ? "Creating..." : "Create account"}
            onPress={onSignup}
            disabled={loading}
          />

          <Text onPress={() => navigation.navigate("Login")} style={{ color: colors.link }}>
            Already have an account? Log in
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

