# Auth setup (Supabase)

## 1) Environment variables

Copy `mobile/.env.example` to `mobile/.env` and set:

```env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

## 2) Database

Run [`database/schema.sql`](../database/schema.sql) in the Supabase SQL editor. This creates the `profiles` table, RLS policies, and the signup trigger.

## 3) Email/password auth

In Supabase Dashboard → **Authentication → Providers → Email**:

- Enable Email provider
- Choose whether email confirmation is required (if enabled, users must confirm before login)

## 4) Google OAuth

In Supabase Dashboard → **Authentication → Providers → Google**:

1. Enable Google provider
2. Add OAuth client ID and secret from [Google Cloud Console](https://console.cloud.google.com/)
3. Add authorized redirect URLs in Google Cloud:
   - `https://YOUR_PROJECT.supabase.co/auth/v1/callback`

In Supabase Dashboard → **Authentication → URL Configuration**, add redirect URLs:

- `aistudycompanion://auth/callback`
- `exp://127.0.0.1:8081/--/auth/callback` (Expo Go local dev)

The mobile app uses scheme `aistudycompanion` (see `mobile/app.json`).

## 5) Test flows

- **Sign up** with email → confirm email (if required) → log in → complete onboarding
- **Log in** with email/password
- **Continue with Google** → complete onboarding if first visit
- **Sign out** from Settings
