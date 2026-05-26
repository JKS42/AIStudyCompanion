# 06 - UI Design, Colour System, and Student-Friendly UX

This document defines a **calm, focus-first** visual language for a study app: low distraction, high readability, and strong support for **light and dark** modes.

## Design goals

- **Minimal cognitive load**: one primary action per screen; secondary actions tucked away.
- **Fast navigation**: bottom tabs for core areas; stack for auth and deep flows.
- **Accessibility first**: WCAG-friendly contrast, large tap targets (min ~44pt), support dynamic type.
- **Trust and calm**: avoid loud reds except for errors; use soft surfaces and clear hierarchy.

## Colour palette (recommended)

### Brand (focus + growth)

| Token | Light mode | Dark mode | Usage |
|--------|------------|-----------|--------|
| `brandPrimary` | `#2563EB` | `#60A5FA` | Primary buttons, key links, selected tab |
| `brandPrimaryMuted` | `#DBEAFE` | `#1E3A5F` | Chips, subtle highlights |
| `brandAccent` | `#059669` | `#34D399` | Success, streaks, “completed” states |

### Neutrals (backgrounds and text)

| Token | Light | Dark | Usage |
|--------|-------|------|--------|
| `background` | `#F8FAFC` | `#0B1220` | Screen background |
| `surface` | `#FFFFFF` | `#111827` | Cards, inputs |
| `surfaceElevated` | `#FFFFFF` | `#1F2937` | Modals, elevated sheets |
| `border` | `#E2E8F0` | `#374151` | Dividers, input borders |
| `textPrimary` | `#0F172A` | `#F9FAFB` | Headings, body |
| `textSecondary` | `#64748B` | `#9CA3AF` | Captions, hints |
| `textMuted` | `#94A3B8` | `#6B7280` | Placeholders, disabled |

### Semantic

| Token | Light | Dark | Usage |
|--------|-------|------|--------|
| `error` | `#B91C1C` | `#F87171` | Form errors, destructive emphasis |
| `warning` | `#D97706` | `#FBBF24` | Warnings, “needs attention” |
| `info` | `#0284C7` | `#38BDF8` | Tips, neutral alerts |

### Study-specific accents (optional, use sparingly)

- **Pomodoro work**: `#DC2626` (light) / `#F87171` (dark) — only on timer screen.
- **Break**: `#0D9488` — short breaks feel restorative.

## Typography

- **Headings**: semibold to bold; avoid ultra-heavy weights on long paragraphs.
- **Body**: 16–17sp default; allow scaling with system font size.
- **Line height**: ~1.4 for body text in summaries and quiz explanations.

## Layout and spacing

- Base unit **8px**: padding 16–24 on screens; 12–16 between related controls.
- **Cards**: 12–16 radius, subtle border or shadow (one, not both, for calm UI).
- **Bottom tab bar**: keep icons + short labels; avoid more than 5 tabs.

## Motion

- Prefer **short** transitions (150–250ms) for navigation; avoid flashy animations during study flows.

## Screen-level UX notes

| Screen | UX focus |
|--------|----------|
| Login / Signup | Clear errors, no clutter; single-column form |
| Dashboard | “Continue studying” as primary CTA |
| Library | Scannable list; search + filters |
| Upload | Obvious progress; retry on failure |
| Summary | Collapsible sections; export/share secondary |
| Quiz | One question per view; large answer targets |
| Flashcards | Large flip area; easy/medium/hard as clear buttons |
| Progress | Simple charts; avoid dashboard overload |
| Settings | Privacy, theme, notifications grouped |

## Implementation

Shared tokens live in:

- [`mobile/src/theme/colors.ts`](../mobile/src/theme/colors.ts)

Screens should import these tokens instead of hard-coding hex values so **dark mode** can be added consistently later (e.g. with `useColorScheme()` or a small theme context).

## Accessibility checklist

- [ ] Minimum contrast **4.5:1** for body text on backgrounds
- [ ] Visible focus / pressed states on buttons and links
- [ ] `accessibilityLabel` on icon-only controls
- [ ] Support **Reduce Motion** where custom animations exist
- [ ] Test with largest font sizes on iOS and Android

## References

- [Material Design – Color system](https://m3.material.io/styles/color/overview)
- [Apple HIG – Color](https://developer.apple.com/design/human-interface-guidelines/color)
- [WCAG 2.2 Contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
