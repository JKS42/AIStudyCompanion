import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import { supabase } from "../../shared/supabase";

WebBrowser.maybeCompleteAuthSession();

const redirectTo = makeRedirectUri({
  scheme: "aistudycompanion",
  path: "auth/callback"
});

async function createSessionFromUrl(url: string) {
  const { params, errorCode } = QueryParams.getQueryParams(url);
  if (errorCode) throw new Error(errorCode);

  const accessToken = params.access_token;
  const refreshToken = params.refresh_token;

  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    });
    if (error) throw error;
    return;
  }

  const code = params.code;
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
    return;
  }

  throw new Error("No auth tokens returned from Google sign-in.");
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      skipBrowserRedirect: true
    }
  });

  if (error) throw error;
  if (!data.url) throw new Error("Google sign-in URL was not returned.");

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== "success") {
    throw new Error("Google sign-in was cancelled.");
  }

  await createSessionFromUrl(result.url);
}

export function registerAuthDeepLinkHandler() {
  const subscription = Linking.addEventListener("url", (event: { url: string }) => {
    if (event.url.includes("auth/callback")) {
      void createSessionFromUrl(event.url);
    }
  });

  void Linking.getInitialURL().then((url: string | null) => {
    if (url?.includes("auth/callback")) {
      void createSessionFromUrl(url);
    }
  });

  return () => subscription.remove();
}
