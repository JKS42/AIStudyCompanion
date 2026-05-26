import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { DashboardScreen } from "../../features/dashboard/screens/DashboardScreen";
import { LibraryScreen } from "../../features/library/screens/LibraryScreen";
import { SettingsScreen } from "../../features/settings/screens/SettingsScreen";

export type MainTabParamList = {
  Dashboard: undefined;
  Library: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: "Home" }} />
      <Tab.Screen name="Library" component={LibraryScreen} options={{ title: "Library" }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: "Settings" }} />
    </Tab.Navigator>
  );
}

