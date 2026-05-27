export type AuthProviderType = "email" | "google";

export type EducationLevel =
  | "high_school"
  | "undergraduate"
  | "graduate"
  | "self_learner"
  | "other";

export type UserProfile = {
  id: string;
  email: string | null;
  auth_provider: AuthProviderType | null;
  full_name: string | null;
  avatar_url: string | null;
  education_level: EducationLevel | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
};

export type OnboardingInput = {
  fullName: string;
  educationLevel: EducationLevel;
};
