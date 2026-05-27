import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { DashboardScreen } from "../../features/dashboard/screens/DashboardScreen";
import { SettingsScreen } from "../../features/settings/screens/SettingsScreen";
import { LibraryStack } from "./LibraryStack";

import type { LibraryStackParamList } from "./LibraryStack";

export type MainTabParamList = {
  Dashboard: undefined;
  Library:
    | undefined
    | {
        screen: keyof LibraryStackParamList;
        params?: LibraryStackParamList[keyof LibraryStackParamList];
      };
  Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: "Home" }} />
      <Tab.Screen name="Library" component={LibraryStack} options={{ title: "Library", headerShown: false }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: "Settings" }} />
    </Tab.Navigator>
  );
}

