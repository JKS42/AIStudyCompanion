import { Button, SafeAreaView, Text, View } from "react-native";
import { useAuth } from "../../../app/providers/AuthProvider";
import { colors } from "../../../theme/colors";
import { spacing } from "../../../theme/spacing";

export function SettingsScreen() {
  const { signOut } = useAuth();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: spacing.lg }}>
        <Text style={{ fontSize: 22, fontWeight: "700", color: colors.textPrimary }}>Settings</Text>
        <View style={{ marginTop: spacing.lg }}>
          <Button color={colors.brandPrimary} title="Sign out" onPress={() => signOut()} />
        </View>
      </View>
    </SafeAreaView>
  );
}

