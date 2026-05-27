import { Button, SafeAreaView, Text, View } from "react-native";
import { useAuth } from "../../../app/providers/AuthProvider";
import { useProfile } from "../../../app/providers/ProfileProvider";
import { colors } from "../../../theme/colors";
import { spacing } from "../../../theme/spacing";

const educationLabels: Record<string, string> = {
  high_school: "High school",
  undergraduate: "Undergraduate",
  graduate: "Graduate",
  self_learner: "Self-learner",
  other: "Other"
};

export function SettingsScreen() {
  const { signOut } = useAuth();
  const { profile } = useProfile();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: spacing.lg, gap: spacing.lg }}>
        <Text style={{ fontSize: 22, fontWeight: "700", color: colors.textPrimary }}>Settings</Text>

        <View
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            padding: spacing.lg,
            gap: spacing.sm
          }}
        >
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Profile</Text>
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "600" }}>
            {profile?.full_name ?? "—"}
          </Text>
          <Text style={{ color: colors.textSecondary }}>{profile?.email ?? "—"}</Text>
          <Text style={{ color: colors.textSecondary }}>
            Level:{" "}
            {profile?.education_level ? educationLabels[profile.education_level] : "Not set"}
          </Text>
          <Text style={{ color: colors.textSecondary }}>
            Signed in with: {profile?.auth_provider ?? "—"}
          </Text>
        </View>

        <Button color={colors.brandPrimary} title="Sign out" onPress={() => signOut()} />
      </View>
    </SafeAreaView>
  );
}
