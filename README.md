# AI-Powered Study Companion

Portfolio-quality, end-to-end mobile product demonstrating:
- modern mobile engineering (React Native + TypeScript + Expo)
- AI integration (summaries, quizzes, flashcards, tutoring)
- scalable backend architecture (Supabase + Edge Functions + Postgres)

## Monorepo Structure

```text
mobile/      # React Native app (Expo)
backend/     # API and AI orchestration services
database/    # SQL schema and migration seeds
docs/        # Product, architecture, milestones, portfolio notes
.github/     # CI/CD workflows
```

## Current Implementation Status

- [x] Product roadmap and release scope finalized
- [x] Technology stack decisions documented
- [x] Initial relational data model created
- [x] Milestones and weekly execution plan documented
- [x] CI/CD + deployment + portfolio presentation assets prepared

## Quick Start

## 1) Mobile app
```bash
cd mobile
npm install
npm run dev
```

### Android emulator (Windows)
See [docs/09-android-emulator-setup.md](docs/09-android-emulator-setup.md).

```powershell
cd mobile
npm run android:emulator
```

## 2) Backend
```bash
cd backend
npm install
npm run dev
```

## 3) Database
Run SQL from [database/schema.sql](database/schema.sql) in Supabase SQL editor.

## UI and accessibility
Design tokens and palette: [docs/06-ui-design-and-colors.md](docs/06-ui-design-and-colors.md). Shared colours live in `mobile/src/theme/colors.ts`.

## Auth setup (email, Google, onboarding)
Follow [docs/07-auth-setup.md](docs/07-auth-setup.md) to configure Supabase providers and redirect URLs.

## Upload setup (Phase 2)
Follow [docs/08-upload-setup.md](docs/08-upload-setup.md) to configure the Storage bucket and test uploads.

## AI summary setup (Phase 3)
Follow [docs/10-ai-summary-setup.md](docs/10-ai-summary-setup.md) to run the backend API and generate summaries from the app.

## Quiz and flashcards (Phase 4)
Follow [docs/11-quiz-flashcards-setup.md](docs/11-quiz-flashcards-setup.md) to generate quizzes, submit attempts, and run flashcard review.

## GitHub setup
Push this repo following [docs/CONTRIBUTING-GITHUB.md](docs/CONTRIBUTING-GITHUB.md).

## Core Portfolio Story

1. **Problem-first product**: Student study workflows are fragmented.
2. **AI feature depth**: Upload → summary → quiz/flashcards → progress analytics.
3. **Production mindset**: Auth security, RLS, CI, monitoring, and app-store readiness.

## Learning Path (Beginner Friendly)

- React Native: https://reactnative.dev
- Expo: https://docs.expo.dev
- Supabase: https://supabase.com/docs
- PostgreSQL: https://www.postgresql.org/docs/current/tutorial.html
- Jest: https://jestjs.io/docs/getting-started
- GitHub Actions: https://docs.github.com/actions
