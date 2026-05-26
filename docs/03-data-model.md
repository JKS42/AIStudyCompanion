# 03 - Data Model and Migration Notes

Primary schema lives in [database/schema.sql](../database/schema.sql).

## Relationships
- `users` 1:N `notes`
- `notes` 1:N `uploaded_files`
- `notes` 1:N `summaries`
- `notes` 1:N `quizzes`
- `quizzes` 1:N `quiz_attempts`
- `notes` 1:N `flashcards`
- `users` 1:N `study_sessions`
- `users` 1:N `progress_analytics`

## Migration Strategy
1. Create all base tables and foreign keys.
2. Add indexes for common query patterns.
3. Enable row-level security table by table.
4. Add strict policies keyed by `auth.uid()`.
5. Add aggregation jobs (daily progress snapshots) in later migrations.

## Near-Term Migration Backlog
- Add `ai_jobs` table for async summary/quiz generation queue tracking.
- Add `study_groups` + membership tables for collaboration phase.
- Add `sync_events` table for offline conflict resolution metadata.
