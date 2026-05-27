import { ActivityIndicator, SafeAreaView, View } from "react-native";
import { colors } from "../../theme/colors";

export function SplashScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={colors.brandPrimary} />
      </View>
    </SafeAreaView>
  );
}
