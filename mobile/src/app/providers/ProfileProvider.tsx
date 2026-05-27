import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { completeOnboarding, ensureProfile } from "../../services/profileService";
import type { OnboardingInput, UserProfile } from "../../types/profile";
import { useAuth } from "./AuthProvider";

type ProfileContextValue = {
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  finishOnboarding: (input: OnboardingInput) => Promise<void>;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: PropsWithChildren) {
  const { session } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshProfile = useCallback(async () => {
    if (!session) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const nextProfile = await ensureProfile(session);
      setProfile(nextProfile);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      if (!session) {
        if (!cancelled) {
          setProfile(null);
          setLoading(false);
        }
        return;
      }

      if (!cancelled) {
        setLoading(true);
      }

      try {
        const nextProfile = await ensureProfile(session);
        if (!cancelled) {
          setProfile(nextProfile);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [session]);

  const finishOnboarding = useCallback(
    async (input: OnboardingInput) => {
      if (!session) throw new Error("You must be signed in to complete onboarding.");
      const updated = await completeOnboarding(session.user.id, input);
      setProfile(updated);
    },
    [session]
  );

  const value = useMemo(
    () => ({
      profile,
      loading,
      refreshProfile,
      finishOnboarding
    }),
    [finishOnboarding, loading, profile, refreshProfile]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}
