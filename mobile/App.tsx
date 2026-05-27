import { StatusBar } from "expo-status-bar";
import { ConfigRequiredScreen } from "./src/components/shared/ConfigRequiredScreen";
import { hasValidPublicEnv } from "./src/shared/env";

export default function App() {
  if (!hasValidPublicEnv()) {
    return (
      <>
        <ConfigRequiredScreen />
        <StatusBar style="auto" />
      </>
    );
  }

  const { RootApp } = require("./src/app/RootApp") as typeof import("./src/app/RootApp");

  return (
    <>
      <RootApp />
      <StatusBar style="auto" />
    </>
  );
}
