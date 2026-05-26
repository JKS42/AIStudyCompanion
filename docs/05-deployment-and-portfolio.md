# 05 - Deployment, CI/CD, and Portfolio Presentation

## Deployment Plan

## Mobile
- Use Expo EAS for Android/iOS build profiles (dev, preview, production)
- Internal distribution for testers before store submission

## Backend
- Use Supabase hosted project for DB/Auth/Storage
- Deploy API service or edge functions for AI orchestration
- Configure environment secrets only in deployment platform

## CI/CD
- GitHub Actions workflow added at `.github/workflows/ci.yml`
- Enforce checks on pull requests:
  - dependency install
  - type checks
  - lint
  - backend smoke checks

## App Store Preparation Checklist
- [ ] App icon and launch assets
- [ ] 8-10 screenshots (light + dark mode)
- [ ] Privacy policy and terms page
- [ ] Data-safety declarations
- [ ] Closed beta test feedback incorporated

## Portfolio and CV Narrative
Use this project description:

> Built an AI-powered mobile Study Companion using React Native, Supabase, and LLM APIs. Implemented secure authentication, document upload and parsing, AI summaries, quiz and flashcard generation, progress analytics, and CI/CD pipelines with production-minded security and observability.

## Demo Video Script (60-90 seconds)
1. Login and open dashboard
2. Upload a PDF/note
3. Generate AI summary
4. Generate and attempt quiz
5. Review flashcards
6. Show progress dashboard and streak
7. End with architecture slide and tech stack
