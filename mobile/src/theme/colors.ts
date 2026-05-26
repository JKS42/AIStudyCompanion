/**
 * Study-app colour tokens: calm neutrals + clear brand accent.
 * Use `light` / `dark` when wiring useColorScheme(); default export is light for simplicity.
 */

export const colorsLight = {
  brandPrimary: "#2563EB",
  brandPrimaryMuted: "#DBEAFE",
  brandAccent: "#059669",

  background: "#F8FAFC",
  surface: "#FFFFFF",
  surfaceElevated: "#FFFFFF",
  border: "#E2E8F0",

  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",

  error: "#B91C1C",
  warning: "#D97706",
  info: "#0284C7",

  link: "#2563EB",
  inputBackground: "#FFFFFF"
} as const;

export const colorsDark = {
  brandPrimary: "#60A5FA",
  brandPrimaryMuted: "#1E3A5F",
  brandAccent: "#34D399",

  background: "#0B1220",
  surface: "#111827",
  surfaceElevated: "#1F2937",
  border: "#374151",

  textPrimary: "#F9FAFB",
  textSecondary: "#9CA3AF",
  textMuted: "#6B7280",

  error: "#F87171",
  warning: "#FBBF24",
  info: "#38BDF8",

  link: "#60A5FA",
  inputBackground: "#1F2937"
} as const;

export type AppColors = typeof colorsLight;

/** Default theme (light). Screens can switch to colorsDark when dark mode is enabled. */
export const colors = colorsLight;
