# 02 - Technology Stack Decisions

## Mobile Frontend
- **React Native (Expo) + TypeScript**
  - Fast iteration and easy portfolio demos
  - Large ecosystem and broad hiring relevance
- **Navigation:** React Navigation (stack + bottom tabs)
- **State:** Zustand (local state) + TanStack Query (server state/cache)
- **Forms/Validation:** React Hook Form + Zod
- **UI:** NativeWind or Tamagui with design tokens

## Backend
- **Supabase**
  - Auth (email + OAuth)
  - Postgres relational database
  - Storage buckets for uploads
  - Edge functions for AI orchestration

## AI Layer
- LLM provider called via backend proxy (never from mobile client)
- Versioned prompts stored server-side
- Model routing:
  - lower-cost model for summaries/flashcards/basic quizzes
  - stronger model for tutoring and complex tasks
- Token and latency logging for cost/performance control

## Why This Stack Is Portfolio-Strong
1. Demonstrates mobile engineering fundamentals
2. Demonstrates backend data modeling and auth security
3. Demonstrates practical AI product integration with guardrails
4. Shows production-readiness via observability and CI/CD
