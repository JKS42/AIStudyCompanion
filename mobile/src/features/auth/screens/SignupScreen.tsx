import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, Button, Pressable, SafeAreaView, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../../app/navigation/AuthStack";
import { useAuth } from "../../../app/providers/AuthProvider";
import { AuthTextField } from "../../../components/ui/AuthTextField";
import { signupSchema, type SignupValues } from "../schemas";
import { colors } from "../../../theme/colors";
import { spacing } from "../../../theme/spacing";

type Props = NativeStackScreenProps<AuthStackParamList, "Signup">;

export function SignupScreen({ navigation }: Props) {
  const { signUpWithEmail, signInWithGoogle } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", email: "", password: "" }
  });

  async function onSubmit(values: SignupValues) {
    setFormError(null);
    try {
      await signUpWithEmail(values.email.trim(), values.password, values.fullName.trim());
      Alert.alert(
        "Account created",
        "Check your email to confirm your account, then log in.",
        [{ text: "OK", onPress: () => navigation.navigate("Login") }]
      );
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Signup failed");
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
          Create your account
        </Text>
        <Text style={{ color: colors.textSecondary }}>Start organizing your study workflow.</Text>

        <View style={{ marginTop: spacing.md, gap: spacing.md }}>
          <AuthTextField
            control={control}
            name="fullName"
            label="Full name"
            placeholder="Jane Doe"
            error={errors.fullName?.message}
          />

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
            placeholder="At least 8 characters"
            secureTextEntry
            error={errors.password?.message}
          />

          {formError ? <Text style={{ color: colors.error }}>{formError}</Text> : null}

          <Button
            color={colors.brandPrimary}
            title={isSubmitting ? "Creating..." : "Create account"}
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

          <Text onPress={() => navigation.navigate("Login")} style={{ color: colors.link }}>
            Already have an account? Log in
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
