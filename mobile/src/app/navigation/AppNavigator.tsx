import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SplashScreen } from "../../components/shared/SplashScreen";
import { useAuth } from "../providers/AuthProvider";
import { useProfile } from "../providers/ProfileProvider";
import { AuthStack } from "./AuthStack";
import { MainTabs } from "./MainTabs";
import { OnboardingStack } from "./OnboardingStack";

export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { session, bootstrapping } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  if (bootstrapping || (session && (profileLoading || !profile))) {
    return <SplashScreen />;
  }

  const needsOnboarding = Boolean(profile && !profile.onboarding_completed);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!session ? (
        <Stack.Screen name="Auth" component={AuthStack} />
      ) : needsOnboarding ? (
        <Stack.Screen name="Onboarding" component={OnboardingStack} />
      ) : (
        <Stack.Screen name="Main" component={MainTabs} />
      )}
    </Stack.Navigator>
  );
}
