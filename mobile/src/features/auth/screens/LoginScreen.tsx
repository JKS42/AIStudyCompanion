import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Pressable, SafeAreaView, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../../app/navigation/AuthStack";
import { useAuth } from "../../../app/providers/AuthProvider";
import { AuthTextField } from "../../../components/ui/AuthTextField";
import { loginSchema, type LoginValues } from "../schemas";
import { colors } from "../../../theme/colors";
import { spacing } from "../../../theme/spacing";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const { signInWithPassword, signInWithGoogle } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  });

  async function onSubmit(values: LoginValues) {
    setFormError(null);
    try {
      await signInWithPassword(values.email.trim(), values.password);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Login failed");
    }
  }

  async function onGoogleSignIn() {
    setFormError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Google sign-in failed");
    } finally {
      setGoogleLoading(false);
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
          <AuthTextField
            control={control}
            name="email"
            label="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
            error={errors.email?.message}
          />

          <AuthTextField
            control={control}
            name="password"
            label="Password"
            placeholder="Your password"
            secureTextEntry
            error={errors.password?.message}
          />

          {formError ? <Text style={{ color: colors.error }}>{formError}</Text> : null}

          <Button
            color={colors.brandPrimary}
            title={isSubmitting ? "Logging in..." : "Log in"}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting || googleLoading}
          />

          <Pressable
            onPress={onGoogleSignIn}
            disabled={isSubmitting || googleLoading}
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surface,
              paddingVertical: spacing.md,
              alignItems: "center",
              borderRadius: 8
            }}
          >
            <Text style={{ color: colors.textPrimary, fontWeight: "600" }}>
              {googleLoading ? "Connecting to Google..." : "Continue with Google"}
            </Text>
          </Pressable>

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
