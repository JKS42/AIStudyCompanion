# 04 - Development Phases, Deliverables, QA Gates

## Phase 1 (Week 1-2): Setup + Authentication
Deliverables:
- Mobile and backend bootstrapped
- Email/password + Google login
- Profile onboarding
- Protected app navigation

QA Gates:
- [ ] Auth success/failure flows tested
- [ ] Session persistence after app restart
- [ ] Basic lint/type checks passing

## Phase 2 (Week 3): File Upload + Storage
Deliverables:
- Upload UI for PDF/image/text/audio
- Storage integration
- File metadata persistence
- Processing states in UI

QA Gates:
- [ ] Type/size validation
- [ ] Retry/cancel support
- [ ] Upload errors are user-readable

## Phase 3 (Week 4-5): AI Summaries
Deliverables:
- Extraction + summarization endpoints
- Prompt versioning
- Summary display and save
- Token/cost logging

QA Gates:
- [ ] Summary quality reviewed on 10+ sample notes
- [ ] Timeout/fallback handling works
- [ ] p95 generation latency tracked

## Phase 4 (Week 6): Quiz + Flashcards
Deliverables:
- Quiz generation and attempts
- Flashcard generation and review flow
- Difficulty selection and scoring

QA Gates:
- [ ] Question format validation
- [ ] Score calculation accuracy
- [ ] Flashcard review queue behavior

## Phase 5 (Week 7): Analytics + Gamification
Deliverables:
- Progress dashboard
- Pomodoro session tracking
- Streak logic + reminder notifications

QA Gates:
- [ ] Daily aggregation correctness
- [ ] Streak edge cases (missed day, timezone)
- [ ] Dashboard charts match source data

## Phase 6 (Week 8): Hardening + Deployment
Deliverables:
- Test coverage baseline
- CI workflow
- Beta builds
- Portfolio assets

QA Gates:
- [ ] Critical user journeys pass E2E smoke tests
- [ ] Crash/error monitoring configured
- [ ] Production environment and secrets validated
