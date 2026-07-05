-- ============================================================================
-- 005: Streaks, Achievements, and Compliance support
-- ============================================================================

-- Streaks: one row per client per streak type, updated daily
create table if not exists public.streaks (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  streak_type text not null, -- 'workout' | 'checkin' | 'protein' | 'steps' | 'water' | 'weigh_in'
  current_count int not null default 0,
  longest_count int not null default 0,
  last_logged_date date,
  updated_at timestamptz not null default now(),
  unique (client_id, streak_type)
);

create index idx_streaks_client on public.streaks(client_id);

alter table public.streaks enable row level security;
create policy "streaks_client_full" on public.streaks
  for all using (client_id = auth.uid()) with check (client_id = auth.uid());
create policy "streaks_coach_read" on public.streaks
  for select using (public.is_coach_of(client_id));

-- Achievements: earned badges
create table if not exists public.achievements (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  badge_key text not null, -- e.g. 'first_workout', '30_day_streak', '100kg_bench'
  earned_at timestamptz not null default now(),
  unique (client_id, badge_key)
);

create index idx_achievements_client on public.achievements(client_id);

alter table public.achievements enable row level security;
create policy "achievements_client_full" on public.achievements
  for all using (client_id = auth.uid()) with check (client_id = auth.uid());
create policy "achievements_coach_read" on public.achievements
  for select using (public.is_coach_of(client_id));

-- Add extra check-in fields to existing checkins table
alter table public.checkins
  add column if not exists hunger_rating int check (hunger_rating between 1 and 5),
  add column if not exists recovery_rating int check (recovery_rating between 1 and 5),
  add column if not exists motivation_rating int check (motivation_rating between 1 and 5),
  add column if not exists soreness_rating int check (soreness_rating between 1 and 5),
  add column if not exists digestion_rating int check (digestion_rating between 1 and 5),
  add column if not exists biggest_win text,
  add column if not exists biggest_struggle text;
