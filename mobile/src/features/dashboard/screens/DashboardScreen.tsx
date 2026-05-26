import { SafeAreaView, Text, View } from "react-native";
import { colors } from "../../../theme/colors";
import { spacing } from "../../../theme/spacing";

export function DashboardScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: spacing.lg }}>
        <Text style={{ fontSize: 22, fontWeight: "700", color: colors.textPrimary }}>Dashboard</Text>
        <Text style={{ marginTop: spacing.sm, color: colors.textSecondary }}>You’re signed in.</Text>
      </View>
    </SafeAreaView>
  );
}

