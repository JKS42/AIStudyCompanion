import Constants from "expo-constants";

type PublicEnv = {
  supabaseUrl: string;
  supabaseAnonKey: string;
};

function isPlaceholder(value: string): boolean {
  return value.includes("${") || value.includes("YOUR_");
}

function isValidSupabaseUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function readFromExpoPublic(): PublicEnv | null {
  // Expo SDK 49+ supports EXPO_PUBLIC_* on process.env during bundling,
  // and also exposes `extra` via app config for fallback.
  const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, unknown>;

  const url =
    (process.env.EXPO_PUBLIC_SUPABASE_URL as string | undefined) ??
    (extra.EXPO_PUBLIC_SUPABASE_URL as string | undefined);
  const anon =
    (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string | undefined) ??
    (extra.EXPO_PUBLIC_SUPABASE_ANON_KEY as string | undefined);

  if (!url || !anon || isPlaceholder(url) || isPlaceholder(anon)) return null;
  if (!isValidSupabaseUrl(url)) return null;
  return { supabaseUrl: url, supabaseAnonKey: anon };
}

export function hasValidPublicEnv(): boolean {
  return readFromExpoPublic() !== null;
}

export function getPublicEnv(): PublicEnv {
  const env = readFromExpoPublic();
  if (!env) {
    throw new Error(
      "Missing Supabase env. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY."
    );
  }
  return env;
}

