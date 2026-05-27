import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

export const signupSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

export const resetPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address")
});

export const onboardingSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  educationLevel: z.enum(["high_school", "undergraduate", "graduate", "self_learner", "other"])
});

export type LoginValues = z.infer<typeof loginSchema>;
export type SignupValues = z.infer<typeof signupSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
export type OnboardingValues = z.infer<typeof onboardingSchema>;
