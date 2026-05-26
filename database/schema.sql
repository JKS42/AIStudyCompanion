-- AI Study Companion - Initial Relational Schema (Supabase/Postgres)
-- This schema is designed for Supabase (Postgres + Auth + RLS).
-- Privacy goals:
-- - All user-owned rows are isolated by `auth.uid()` (RLS)
-- - No app data is readable/writable cross-user
-- - User profile rows are keyed by `auth.users.id` (not random UUIDs)

-- Enable UUID support
create extension if not exists "pgcrypto";

-- Recommended for case-insensitive emails/usernames (optional, safe default)
create extension if not exists "citext";

-- Utilities
create schema if not exists app;

create or replace function app.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- User profile table (1:1 with Supabase Auth user)
-- Keep personally identifying info minimal. Avoid storing raw passwords (Auth handles it).
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email citext unique, -- optional; can be null if you prefer deriving from auth.users
  auth_provider text check (auth_provider in ('email','google')),
  full_name text,
  avatar_url text,
  education_level text,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function app.set_updated_at();

-- Auto-provision a profile row on signup.
-- Note: relies on RLS policies below that allow the user to see/update their own profile.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, auth_provider)
  values (
    new.id,
    new.email,
    coalesce(new.raw_app_meta_data->>'provider', new.app_metadata->>'provider')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  subject text,
  tags text[] default '{}',
  source_type text not null check (source_type in ('typed','pdf','image','voice')),
  raw_text text,
  status text not null default 'uploaded' check (status in ('uploaded','processing','ready','failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_notes_updated_at on notes;
create trigger trg_notes_updated_at
before update on notes
for each row execute function app.set_updated_at();

create table if not exists uploaded_files (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references notes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  -- Prefer referencing Supabase Storage objects (bucket/path), not public URLs.
  -- Store signed URLs only client-side; store these stable identifiers server-side.
  storage_bucket text not null default 'uploads',
  storage_path text not null,
  file_url text, -- optional legacy field; avoid relying on it for access control
  file_type text not null,
  file_size_bytes bigint not null,
  checksum text,
  ocr_processed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists summaries (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references notes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  summary_text text not null,
  key_points jsonb not null default '[]'::jsonb,
  prompt_version text not null default 'v1',
  model_used text,
  token_usage_input integer default 0,
  token_usage_output integer default 0,
  created_at timestamptz not null default now()
);

create table if not exists flashcards (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references notes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  front_text text not null,
  back_text text not null,
  difficulty integer not null default 3 check (difficulty between 1 and 5),
  next_review_at timestamptz,
  review_count integer not null default 0,
  last_result text check (last_result in ('easy','medium','hard')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_flashcards_updated_at on flashcards;
create trigger trg_flashcards_updated_at
before update on flashcards
for each row execute function app.set_updated_at();

create table if not exists quizzes (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references notes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  difficulty_level integer not null default 2 check (difficulty_level between 1 and 3),
  questions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references quizzes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  score_percent numeric(5,2) not null check (score_percent >= 0 and score_percent <= 100),
  time_spent_seconds integer not null default 0,
  answers jsonb not null default '[]'::jsonb,
  completed_at timestamptz not null default now()
);

create table if not exists study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  mode text not null check (mode in ('pomodoro','focus','review')),
  planned_minutes integer not null default 25,
  actual_minutes integer not null default 0,
  note_id uuid references notes(id) on delete set null,
  started_at timestamptz not null default now(),
  ended_at timestamptz
);

create table if not exists progress_analytics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  total_study_minutes integer not null default 0,
  quizzes_taken integer not null default 0,
  avg_quiz_score numeric(5,2) not null default 0,
  flashcards_reviewed integer not null default 0,
  streak_days integer not null default 0,
  weak_topics jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique(user_id, date)
);

create index if not exists idx_notes_user_created on notes(user_id, created_at desc);
create index if not exists idx_flashcards_user_next_review on flashcards(user_id, next_review_at);
create index if not exists idx_quiz_attempts_user_completed on quiz_attempts(user_id, completed_at desc);
create index if not exists idx_uploaded_files_user_created on uploaded_files(user_id, created_at desc);
create index if not exists idx_summaries_note_created on summaries(note_id, created_at desc);
create index if not exists idx_quizzes_note_created on quizzes(note_id, created_at desc);

-- Row-level security (Supabase)
alter table public.profiles enable row level security;
alter table notes enable row level security;
alter table uploaded_files enable row level security;
alter table summaries enable row level security;
alter table flashcards enable row level security;
alter table quizzes enable row level security;
alter table quiz_attempts enable row level security;
alter table study_sessions enable row level security;
alter table progress_analytics enable row level security;

-- Stronger guarantee: owners can't accidentally bypass RLS via table owner.
alter table public.profiles force row level security;
alter table notes force row level security;
alter table uploaded_files force row level security;
alter table summaries force row level security;
alter table flashcards force row level security;
alter table quizzes force row level security;
alter table quiz_attempts force row level security;
alter table study_sessions force row level security;
alter table progress_analytics force row level security;

-- Policies: "private by default" (no cross-user access).
-- Profiles
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Notes
drop policy if exists "notes_crud_own" on notes;
create policy "notes_crud_own" on notes
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Uploaded files
drop policy if exists "uploaded_files_crud_own" on uploaded_files;
create policy "uploaded_files_crud_own" on uploaded_files
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Summaries
drop policy if exists "summaries_crud_own" on summaries;
create policy "summaries_crud_own" on summaries
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Flashcards
drop policy if exists "flashcards_crud_own" on flashcards;
create policy "flashcards_crud_own" on flashcards
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Quizzes
drop policy if exists "quizzes_crud_own" on quizzes;
create policy "quizzes_crud_own" on quizzes
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Quiz attempts
drop policy if exists "quiz_attempts_crud_own" on quiz_attempts;
create policy "quiz_attempts_crud_own" on quiz_attempts
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Study sessions
drop policy if exists "study_sessions_crud_own" on study_sessions;
create policy "study_sessions_crud_own" on study_sessions
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Progress analytics
drop policy if exists "progress_analytics_crud_own" on progress_analytics;
create policy "progress_analytics_crud_own" on progress_analytics
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Optional: lock down public access explicitly (Supabase defaults vary by project).
revoke all on public.profiles from anon;
revoke all on notes from anon;
revoke all on uploaded_files from anon;
revoke all on summaries from anon;
revoke all on flashcards from anon;
revoke all on quizzes from anon;
revoke all on quiz_attempts from anon;
revoke all on study_sessions from anon;
revoke all on progress_analytics from anon;

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on notes to authenticated;
grant select, insert, update, delete on uploaded_files to authenticated;
grant select, insert, update, delete on summaries to authenticated;
grant select, insert, update, delete on flashcards to authenticated;
grant select, insert, update, delete on quizzes to authenticated;
grant select, insert, update, delete on quiz_attempts to authenticated;
grant select, insert, update, delete on study_sessions to authenticated;
grant select, insert, update, delete on progress_analytics to authenticated;
