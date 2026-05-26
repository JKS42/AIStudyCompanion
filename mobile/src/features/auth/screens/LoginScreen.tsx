import { useState } from "react";
import { Button, SafeAreaView, Text, TextInput, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../../app/navigation/AuthStack";
import { useAuth } from "../../../app/providers/AuthProvider";
import { colors } from "../../../theme/colors";
import { radii, spacing } from "../../../theme/spacing";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const { signInWithPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onLogin() {
    setError(null);
    setLoading(true);
    try {
      await signInWithPassword(email.trim(), password);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: spacing.lg, gap: spacing.md }}>
        <Text style={{ fontSize: 26, fontWeight: "800", color: colors.textPrimary }}>
          Welcome back
        </Text>
        <Text style={{ color: colors.textSecondary }}>Log in to continue studying.</Text>

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

          <View style={{ gap: 6 }}>
            <Text style={{ color: colors.textPrimary }}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Your password"
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
            title={loading ? "Logging in..." : "Log in"}
            onPress={onLogin}
            disabled={loading}
          />

          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
            <Text onPress={() => navigation.navigate("ResetPassword")} style={{ color: colors.link }}>
              Forgot password?
            </Text>
            <Text onPress={() => navigation.navigate("Signup")} style={{ color: colors.link }}>
              Create account
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

