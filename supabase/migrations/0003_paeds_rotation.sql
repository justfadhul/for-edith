-- For Edith: a second rotation (Paediatrics).
-- Run in the Supabase SQL editor after 0002_session_overrides.sql.
-- Until it has run, the app keeps syncing settings without these columns (the rotation then stays per device).

alter table public.user_settings
  add column if not exists active_rotation text not null default 'obgyn',  -- the rotation every list follows
  add column if not exists paeds_start     date;                            -- Monday of Paediatrics week 1

alter table public.user_settings drop constraint if exists user_settings_active_rotation_check;
alter table public.user_settings
  add constraint user_settings_active_rotation_check check (active_rotation in ('obgyn', 'paeds'));

-- Paediatrics reschedules live in session_overrides too: their session_key starts with 'paeds:'.
