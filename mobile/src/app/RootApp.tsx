import { NavigationContainer } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppNavigator } from "./navigation/AppNavigator";
import { AuthProvider } from "./providers/AuthProvider";
import { ProfileProvider } from "./providers/ProfileProvider";

const queryClient = new QueryClient();

export function RootApp() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ProfileProvider>
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </ProfileProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
