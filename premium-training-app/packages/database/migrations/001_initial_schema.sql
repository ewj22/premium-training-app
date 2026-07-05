-- ============================================================================
-- PREMIUM TRAINING APP — INITIAL SCHEMA
-- Supabase Postgres. Run migrations in order via `supabase db push`.
-- ============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================================
-- ENUMS
-- ============================================================================

create type user_role as enum ('client', 'coach', 'admin');
create type invite_status as enum ('pending', 'accepted', 'revoked');
create type workout_status as enum ('draft', 'scheduled', 'completed', 'skipped');
create type set_type as enum ('normal', 'warmup', 'dropset', 'failure', 'amrap');
create type checkin_status as enum ('pending', 'submitted', 'reviewed');
create type message_sender as enum ('client', 'coach');
create type habit_type as enum ('steps', 'water', 'sleep', 'custom');
create type media_type as enum ('image', 'video');

-- ============================================================================
-- CORE USER TABLES
-- ============================================================================

-- Extends Supabase auth.users. One row per authenticated user.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'client',
  full_name text not null,
  avatar_url text,
  phone text,
  timezone text default 'UTC',
  date_of_birth date,
  sex text check (sex in ('male', 'female', 'other', 'prefer_not_to_say')),
  height_cm numeric(5,2),
  onboarding_completed boolean not null default false,
  push_token text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Coach <-> Client relationship. A client belongs to exactly one active coach.
create table public.coach_clients (
  id uuid primary key default uuid_generate_v4(),
  coach_id uuid not null references public.profiles(id) on delete cascade,
  client_id uuid not null references public.profiles(id) on delete cascade,
  status invite_status not null default 'pending',
  invited_at timestamptz not null default now(),
  accepted_at timestamptz,
  archived boolean not null default false,
  unique (coach_id, client_id)
);

create index idx_coach_clients_coach on public.coach_clients(coach_id) where not archived;
create index idx_coach_clients_client on public.coach_clients(client_id) where not archived;

-- ============================================================================
-- EXERCISE LIBRARY
-- ============================================================================

create table public.exercise_categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  sort_order int not null default 0
);

create table public.exercises (
  id uuid primary key default uuid_generate_v4(),
  created_by uuid references public.profiles(id) on delete set null, -- null = global/system exercise
  category_id uuid references public.exercise_categories(id) on delete set null,
  name text not null,
  primary_muscle text not null,
  secondary_muscles text[] default '{}',
  equipment text,
  video_url text,
  thumbnail_url text,
  instructions text,
  is_public boolean not null default true, -- coach-created exercises can be private to their org
  created_at timestamptz not null default now()
);

create index idx_exercises_category on public.exercises(category_id);
create index idx_exercises_name_trgm on public.exercises using gin (name gin_trgm_ops);
create extension if not exists pg_trgm;

-- Substitution suggestions (many-to-many, self-referencing)
create table public.exercise_substitutions (
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  substitute_id uuid not null references public.exercises(id) on delete cascade,
  primary key (exercise_id, substitute_id)
);

-- ============================================================================
-- PROGRAMMES & WORKOUT TEMPLATES (coach-built, assignable, duplicable)
-- ============================================================================

create table public.programmes (
  id uuid primary key default uuid_generate_v4(),
  coach_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  duration_weeks int,
  is_template boolean not null default true, -- template vs client-assigned copy
  duplicated_from uuid references public.programmes(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_programmes_coach on public.programmes(coach_id);

create table public.programme_assignments (
  id uuid primary key default uuid_generate_v4(),
  programme_id uuid not null references public.programmes(id) on delete cascade,
  client_id uuid not null references public.profiles(id) on delete cascade,
  start_date date not null default current_date,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index idx_programme_assignments_client on public.programme_assignments(client_id) where active;

-- Workout template (day within a programme, e.g. "Push Day A")
create table public.workout_templates (
  id uuid primary key default uuid_generate_v4(),
  programme_id uuid not null references public.programmes(id) on delete cascade,
  title text not null,
  day_order int not null default 0,
  notes text
);

create index idx_workout_templates_programme on public.workout_templates(programme_id, day_order);

create table public.workout_template_exercises (
  id uuid primary key default uuid_generate_v4(),
  workout_template_id uuid not null references public.workout_templates(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete restrict,
  sort_order int not null default 0, -- drives drag-and-drop ordering
  target_sets int not null default 3,
  target_reps text default '8-12', -- range as text, e.g. "8-12" or "AMRAP"
  target_rpe numeric(3,1),
  rest_seconds int default 90,
  superset_group int, -- exercises sharing a group number are a superset
  notes text
);

create index idx_wte_template on public.workout_template_exercises(workout_template_id, sort_order);

-- ============================================================================
-- LOGGED WORKOUTS (actual client sessions — the source of truth for progress)
-- ============================================================================

create table public.workout_sessions (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  workout_template_id uuid references public.workout_templates(id) on delete set null,
  title text not null,
  status workout_status not null default 'scheduled',
  scheduled_date date,
  started_at timestamptz,
  completed_at timestamptz,
  duration_seconds int,
  notes text,
  created_at timestamptz not null default now()
);

create index idx_workout_sessions_client on public.workout_sessions(client_id, scheduled_date desc);
create index idx_workout_sessions_status on public.workout_sessions(client_id, status);

create table public.logged_exercises (
  id uuid primary key default uuid_generate_v4(),
  workout_session_id uuid not null references public.workout_sessions(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete restrict,
  sort_order int not null default 0,
  superset_group int,
  notes text
);

create index idx_logged_exercises_session on public.logged_exercises(workout_session_id, sort_order);

create table public.logged_sets (
  id uuid primary key default uuid_generate_v4(),
  logged_exercise_id uuid not null references public.logged_exercises(id) on delete cascade,
  set_number int not null,
  set_type set_type not null default 'normal',
  weight_kg numeric(6,2),
  reps int,
  rpe numeric(3,1),
  is_personal_best boolean not null default false,
  completed boolean not null default false,
  completed_at timestamptz
);

create index idx_logged_sets_exercise on public.logged_sets(logged_exercise_id, set_number);
-- Speeds up progressive-overload / PB queries per client+exercise
create index idx_logged_sets_pb_lookup on public.logged_sets(logged_exercise_id) where is_personal_best;

-- ============================================================================
-- NUTRITION
-- ============================================================================

create table public.nutrition_targets (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  set_by uuid references public.profiles(id) on delete set null, -- coach who set it, null if self-set
  calories int not null,
  protein_g int not null,
  carbs_g int not null,
  fat_g int not null,
  effective_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index idx_nutrition_targets_client on public.nutrition_targets(client_id, effective_date desc);

create table public.nutrition_logs (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  logged_date date not null default current_date,
  meal_name text,
  calories int not null default 0,
  protein_g numeric(6,2) default 0,
  carbs_g numeric(6,2) default 0,
  fat_g numeric(6,2) default 0,
  created_at timestamptz not null default now()
);

create index idx_nutrition_logs_client_date on public.nutrition_logs(client_id, logged_date desc);

-- ============================================================================
-- BODY METRICS, PROGRESS PHOTOS, HABITS
-- ============================================================================

create table public.body_metrics (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  recorded_date date not null default current_date,
  weight_kg numeric(6,2),
  body_fat_pct numeric(4,1),
  waist_cm numeric(5,2),
  chest_cm numeric(5,2),
  hips_cm numeric(5,2),
  created_at timestamptz not null default now(),
  unique (client_id, recorded_date)
);

create index idx_body_metrics_client on public.body_metrics(client_id, recorded_date desc);

create table public.progress_photos (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null, -- Supabase Storage object path
  angle text check (angle in ('front', 'side', 'back')),
  taken_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index idx_progress_photos_client on public.progress_photos(client_id, taken_date desc);

create table public.habit_logs (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  habit_type habit_type not null,
  logged_date date not null default current_date,
  value numeric not null, -- steps count / ml water / hours sleep
  target numeric,
  created_at timestamptz not null default now(),
  unique (client_id, habit_type, logged_date)
);

create index idx_habit_logs_client_date on public.habit_logs(client_id, logged_date desc);

-- ============================================================================
-- WEEKLY CHECK-INS
-- ============================================================================

create table public.checkins (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  coach_id uuid not null references public.profiles(id) on delete cascade,
  week_start_date date not null,
  status checkin_status not null default 'pending',
  weight_kg numeric(6,2),
  energy_rating int check (energy_rating between 1 and 5),
  sleep_rating int check (sleep_rating between 1 and 5),
  stress_rating int check (stress_rating between 1 and 5),
  adherence_pct int check (adherence_pct between 0 and 100),
  client_notes text,
  coach_feedback text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  unique (client_id, week_start_date)
);

create index idx_checkins_coach on public.checkins(coach_id, status);
create index idx_checkins_client on public.checkins(client_id, week_start_date desc);

-- ============================================================================
-- MESSAGING
-- ============================================================================

create table public.conversations (
  id uuid primary key default uuid_generate_v4(),
  coach_id uuid not null references public.profiles(id) on delete cascade,
  client_id uuid not null references public.profiles(id) on delete cascade,
  last_message_at timestamptz,
  unique (coach_id, client_id)
);

create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_role message_sender not null,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text,
  attachment_url text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_messages_conversation on public.messages(conversation_id, created_at desc);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text,
  type text not null, -- 'checkin_reminder' | 'new_message' | 'workout_assigned' | ...
  data jsonb default '{}',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_notifications_user on public.notifications(user_id, created_at desc) where read_at is null;

-- ============================================================================
-- UPDATED_AT TRIGGER HELPER
-- ============================================================================

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger trg_programmes_updated_at before update on public.programmes
  for each row execute function public.set_updated_at();
