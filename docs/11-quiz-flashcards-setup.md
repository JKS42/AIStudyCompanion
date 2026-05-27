# 11 - Quiz and flashcards setup (Phase 4)

## Prerequisites

- Phase 2 uploads and Phase 3 summaries configured
- Backend running with Supabase service role key
- Mobile `EXPO_PUBLIC_API_URL` pointing at the backend

## API endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/ai/quiz/generate` | Create quiz (`noteId`, `difficultyLevel` 1–3) |
| GET | `/api/ai/quiz/:quizId/play` | Questions without answers |
| POST | `/api/ai/quiz/:quizId/attempt` | Submit answers, server scores |
| POST | `/api/ai/flashcards/generate` | Create flashcard deck (`noteId`, `count`) |

## Mobile flows

| Flow | Steps |
|------|--------|
| Quiz | Note detail → pick difficulty → Generate → Start quiz → Submit |
| Flashcards | Note detail → Generate flashcards → Review due |
| Spaced review | Hard +4h, Medium +1d, Easy +3d |

## Scoring (server-side)

- Each question must have exactly 4 options and `correctIndex` 0–3
- Score = `(correct / total) × 100`, rounded to 2 decimals
- Attempt stored in `quiz_attempts` with per-question breakdown

## Test checklist

- [ ] Generate easy/medium/hard quizzes for a typed note
- [ ] Start quiz — correct answers are hidden until submit
- [ ] Submit and verify score matches manual count
- [ ] Generate flashcards (10 cards)
- [ ] Review a card as Hard/Medium/Easy and confirm `next_review_at` updates
- [ ] Due count decreases after reviewing

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Quiz generation fails | Ensure note has summary or extractable text |
| Invalid question format | Regenerate quiz; check backend logs |
| Review due stays at 0 | Cards may be scheduled in the future — check `next_review_at` |
| 401 on API calls | Re-authenticate in the app |
