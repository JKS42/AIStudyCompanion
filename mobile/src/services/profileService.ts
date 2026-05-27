import type { Session } from "@supabase/supabase-js";
import { supabase } from "../shared/supabase";
import type { AuthProviderType, OnboardingInput, UserProfile } from "../types/profile";

function normalizeAuthProvider(provider: string | undefined): AuthProviderType {
  if (provider?.includes("google")) return "google";
  return "email";
}

function profileFromSession(session: Session): Partial<UserProfile> {
  const metadata = session.user.user_metadata ?? {};
  const provider = normalizeAuthProvider(session.user.app_metadata?.provider);

  return {
    id: session.user.id,
    email: session.user.email ?? null,
    auth_provider: provider,
    full_name: (metadata.full_name as string | undefined) ?? (metadata.name as string | undefined) ?? null,
    avatar_url: (metadata.avatar_url as string | undefined) ?? (metadata.picture as string | undefined) ?? null
  };
}

export async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error) throw error;
  return data as UserProfile | null;
}

export async function ensureProfile(session: Session): Promise<UserProfile> {
  const existing = await fetchProfile(session.user.id);
  if (existing) return existing;

  const seed = profileFromSession(session);
  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: session.user.id,
      email: seed.email,
      auth_provider: seed.auth_provider,
      full_name: seed.full_name,
      avatar_url: seed.avatar_url
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as UserProfile;
}

export async function completeOnboarding(userId: string, input: OnboardingInput): Promise<UserProfile> {
  const { data, error } = await supabase
    .from("profiles")
    .update({
      full_name: input.fullName.trim(),
      education_level: input.educationLevel,
      onboarding_completed: true
    })
    .eq("id", userId)
    .select("*")
    .single();

  if (error) throw error;
  return data as UserProfile;
}

export async function updateProfileName(userId: string, fullName: string): Promise<UserProfile> {
  const { data, error } = await supabase
    .from("profiles")
    .update({ full_name: fullName.trim() })
    .eq("id", userId)
    .select("*")
    .single();

  if (error) throw error;
  return data as UserProfile;
}
