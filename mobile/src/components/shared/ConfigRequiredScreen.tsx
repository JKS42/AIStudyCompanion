import { SafeAreaView, Text, View } from "react-native";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

export function ConfigRequiredScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, padding: spacing.lg, justifyContent: "center", gap: spacing.md }}>
        <Text style={{ fontSize: 24, fontWeight: "800", color: colors.textPrimary }}>
          Setup required
        </Text>
        <Text style={{ color: colors.textSecondary, lineHeight: 22 }}>
          Copy mobile/.env.example to mobile/.env and set your Supabase project URL and anon key.
          Restart the dev server after saving the file.
        </Text>
      </View>
    </SafeAreaView>
  );
}
