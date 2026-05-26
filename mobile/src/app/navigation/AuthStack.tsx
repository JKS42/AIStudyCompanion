import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LoginScreen } from "../../features/auth/screens/LoginScreen";
import { SignupScreen } from "../../features/auth/screens/SignupScreen";
import { ResetPasswordScreen } from "../../features/auth/screens/ResetPasswordScreen";

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ResetPassword: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Log in" }} />
      <Stack.Screen name="Signup" component={SignupScreen} options={{ title: "Create account" }} />
      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={{ title: "Reset password" }}
      />
    </Stack.Navigator>
  );
}

