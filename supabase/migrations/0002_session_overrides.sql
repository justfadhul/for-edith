-- For Edith: rescheduled teaching sessions (a lecture/tutorial moved to another day/time).
-- Run in the Supabase SQL editor after 0001_init.sql.

create table if not exists public.session_overrides (
  user_id      uuid not null references auth.users (id) on delete cascade,
  session_key  text not null,          -- stable id of the original timetable slot
  day          integer not null,       -- new day offset from the rotation start
  time         text not null,          -- new time, e.g. '10:00–12:00'
  note         text,                   -- optional reason ("Dr Nanzira at theatre")
  cleared      boolean not null default false, -- true = moved back to the original slot
  updated_at   timestamptz not null default now(),
  primary key (user_id, session_key)
);

alter table public.session_overrides enable row level security;
drop policy if exists "own rows" on public.session_overrides;
create policy "own rows" on public.session_overrides for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
