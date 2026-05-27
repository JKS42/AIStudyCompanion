import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { OnboardingScreen } from "../../features/onboarding/screens/OnboardingScreen";

export type OnboardingStackParamList = {
  ProfileSetup: undefined;
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileSetup" component={OnboardingScreen} />
    </Stack.Navigator>
  );
}
