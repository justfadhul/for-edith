-- For Edith: study-progress schema.
-- Run this once in the Supabase SQL editor (or `supabase db push`).
-- Topic content lives in the repo; Supabase stores only per-user study state.

-- ── Settings ────────────────────────────────────────────────
create table if not exists public.user_settings (
  user_id        uuid primary key references auth.users (id) on delete cascade,
  display_name   text,
  rotation_start date,
  updated_at     timestamptz not null default now()
);

-- ── Topic progress & bookmarks ─────────────────────────────
create table if not exists public.topic_progress (
  user_id     uuid not null references auth.users (id) on delete cascade,
  topic_slug  text not null,
  status      text not null default 'not_started'
              check (status in ('not_started', 'in_progress', 'done')),
  bookmarked  boolean not null default false,
  confidence  smallint check (confidence between 1 and 5),
  updated_at  timestamptz not null default now(),
  primary key (user_id, topic_slug)
);

-- ── Personal notes per topic ───────────────────────────────
create table if not exists public.topic_notes (
  user_id     uuid not null references auth.users (id) on delete cascade,
  topic_slug  text not null,
  body        text not null default '',
  updated_at  timestamptz not null default now(),
  primary key (user_id, topic_slug)
);

-- ── Flashcard spaced repetition (SM-2) ─────────────────────
create table if not exists public.flashcard_reviews (
  user_id        uuid not null references auth.users (id) on delete cascade,
  card_id        text not null,
  topic_slug     text not null,
  ease           real not null default 2.5,
  interval_days  real not null default 0,
  reps           integer not null default 0,
  lapses         integer not null default 0,
  due_at         timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  primary key (user_id, card_id)
);
create index if not exists flashcard_reviews_due_idx on public.flashcard_reviews (user_id, due_at);

-- ── Per-question MCQ statistics ────────────────────────────
create table if not exists public.question_stats (
  user_id       uuid not null references auth.users (id) on delete cascade,
  question_id   text not null,
  topic_slug    text not null,
  attempts      integer not null default 0,
  correct       integer not null default 0,
  last_correct  boolean,
  updated_at    timestamptz not null default now(),
  primary key (user_id, question_id)
);

-- ── Quiz / mock-exam sessions ──────────────────────────────
create table if not exists public.quiz_sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  mode         text not null check (mode in ('practice', 'exam')),
  topics       text[] not null default '{}',
  score        integer not null,
  total        integer not null,
  duration_s   integer,
  created_at   timestamptz not null default now()
);
create index if not exists quiz_sessions_user_idx on public.quiz_sessions (user_id, created_at desc);

-- ── Clinical cases worked through ──────────────────────────
create table if not exists public.case_progress (
  user_id     uuid not null references auth.users (id) on delete cascade,
  case_id     text not null,
  topic_slug  text not null,
  completed   boolean not null default false,
  updated_at  timestamptz not null default now(),
  primary key (user_id, case_id)
);

-- ── Row-level security: each user sees only their own rows ─
do $$
declare t text;
begin
  foreach t in array array[
    'user_settings', 'topic_progress', 'topic_notes', 'flashcard_reviews',
    'question_stats', 'quiz_sessions', 'case_progress'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "own rows" on public.%I', t);
    execute format(
      'create policy "own rows" on public.%I for all to authenticated
         using ((select auth.uid()) = user_id)
         with check ((select auth.uid()) = user_id)', t);
  end loop;
end $$;
