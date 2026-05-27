import { Button, SafeAreaView, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useProfile } from "../../../app/providers/ProfileProvider";
import type { MainTabParamList } from "../../../app/navigation/MainTabs";
import { colors } from "../../../theme/colors";
import { spacing } from "../../../theme/spacing";

export function DashboardScreen() {
  const { profile } = useProfile();
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const firstName = profile?.full_name?.split(" ")[0] ?? "Student";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: spacing.lg, gap: spacing.lg }}>
        <Text style={{ fontSize: 22, fontWeight: "700", color: colors.textPrimary }}>
          Welcome, {firstName}
        </Text>
        <Text style={{ color: colors.textSecondary }}>
          Upload study materials, then open any note in your library to generate an AI summary.
        </Text>
        <Button
          color={colors.brandPrimary}
          title="Upload study material"
          onPress={() => navigation.navigate("Library", { screen: "Upload" })}
        />
      </View>
    </SafeAreaView>
  );
}
