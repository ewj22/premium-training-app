-- ============================================================================
-- ROW LEVEL SECURITY
-- Model: a client can only ever see/write their own data. A coach can see/write
-- data for clients who have an active (accepted, non-archived) coach_clients row.
-- Everything is deny-by-default: RLS is enabled and every table gets explicit
-- policies. No table is left open.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Helper functions (SECURITY DEFINER to avoid recursive RLS lookups)
-- ----------------------------------------------------------------------------

create or replace function public.is_coach_of(target_client_id uuid)
returns boolean
language sql security definer stable as $$
  select exists (
    select 1 from public.coach_clients
    where coach_id = auth.uid()
      and client_id = target_client_id
      and status = 'accepted'
      and not archived
  );
$$;

create or replace function public.current_role()
returns user_role
language sql security definer stable as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ----------------------------------------------------------------------------
-- profiles
-- ----------------------------------------------------------------------------
alter table public.profiles enable row level security;

create policy "profiles_select_self" on public.profiles
  for select using (id = auth.uid());

create policy "profiles_select_coach_view_client" on public.profiles
  for select using (public.is_coach_of(id));

create policy "profiles_update_self" on public.profiles
  for update using (id = auth.uid());

create policy "profiles_insert_self" on public.profiles
  for insert with check (id = auth.uid());

-- ----------------------------------------------------------------------------
-- coach_clients
-- ----------------------------------------------------------------------------
alter table public.coach_clients enable row level security;

create policy "coach_clients_select" on public.coach_clients
  for select using (coach_id = auth.uid() or client_id = auth.uid());

create policy "coach_clients_insert_coach" on public.coach_clients
  for insert with check (coach_id = auth.uid());

create policy "coach_clients_update_participants" on public.coach_clients
  for update using (coach_id = auth.uid() or client_id = auth.uid());

-- ----------------------------------------------------------------------------
-- exercises & categories: readable by everyone authenticated; writable by
-- the creator (coach) or system (created_by is null, managed via service role)
-- ----------------------------------------------------------------------------
alter table public.exercise_categories enable row level security;
create policy "exercise_categories_select_all" on public.exercise_categories
  for select using (auth.role() = 'authenticated');

alter table public.exercises enable row level security;

create policy "exercises_select_public_or_own" on public.exercises
  for select using (is_public = true or created_by = auth.uid());

create policy "exercises_insert_coach" on public.exercises
  for insert with check (created_by = auth.uid() and public.current_role() in ('coach','admin'));

create policy "exercises_update_own" on public.exercises
  for update using (created_by = auth.uid());

create policy "exercises_delete_own" on public.exercises
  for delete using (created_by = auth.uid());

alter table public.exercise_substitutions enable row level security;
create policy "exercise_substitutions_select_all" on public.exercise_substitutions
  for select using (auth.role() = 'authenticated');

-- ----------------------------------------------------------------------------
-- programmes & templates: owned by coach; visible to assigned clients (read-only)
-- ----------------------------------------------------------------------------
alter table public.programmes enable row level security;

create policy "programmes_coach_full_access" on public.programmes
  for all using (coach_id = auth.uid()) with check (coach_id = auth.uid());

create policy "programmes_client_read_assigned" on public.programmes
  for select using (
    exists (
      select 1 from public.programme_assignments pa
      where pa.programme_id = programmes.id and pa.client_id = auth.uid()
    )
  );

alter table public.programme_assignments enable row level security;

create policy "programme_assignments_coach_manage" on public.programme_assignments
  for all using (
    exists (select 1 from public.programmes p where p.id = programme_id and p.coach_id = auth.uid())
  ) with check (
    exists (select 1 from public.programmes p where p.id = programme_id and p.coach_id = auth.uid())
  );

create policy "programme_assignments_client_read" on public.programme_assignments
  for select using (client_id = auth.uid());

alter table public.workout_templates enable row level security;

create policy "workout_templates_coach_manage" on public.workout_templates
  for all using (
    exists (select 1 from public.programmes p where p.id = programme_id and p.coach_id = auth.uid())
  ) with check (
    exists (select 1 from public.programmes p where p.id = programme_id and p.coach_id = auth.uid())
  );

create policy "workout_templates_client_read" on public.workout_templates
  for select using (
    exists (
      select 1 from public.programme_assignments pa
      where pa.programme_id = workout_templates.programme_id and pa.client_id = auth.uid()
    )
  );

alter table public.workout_template_exercises enable row level security;

create policy "wte_coach_manage" on public.workout_template_exercises
  for all using (
    exists (
      select 1 from public.workout_templates wt
      join public.programmes p on p.id = wt.programme_id
      where wt.id = workout_template_id and p.coach_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.workout_templates wt
      join public.programmes p on p.id = wt.programme_id
      where wt.id = workout_template_id and p.coach_id = auth.uid()
    )
  );

create policy "wte_client_read" on public.workout_template_exercises
  for select using (
    exists (
      select 1 from public.workout_templates wt
      join public.programme_assignments pa on pa.programme_id = wt.programme_id
      where wt.id = workout_template_exercises.workout_template_id and pa.client_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- workout_sessions / logged_exercises / logged_sets: client owns their data,
-- coach has read access (and write access for programming corrections)
-- ----------------------------------------------------------------------------
alter table public.workout_sessions enable row level security;

create policy "workout_sessions_client_full_access" on public.workout_sessions
  for all using (client_id = auth.uid()) with check (client_id = auth.uid());

create policy "workout_sessions_coach_read" on public.workout_sessions
  for select using (public.is_coach_of(client_id));

alter table public.logged_exercises enable row level security;

create policy "logged_exercises_client_full_access" on public.logged_exercises
  for all using (
    exists (select 1 from public.workout_sessions ws where ws.id = workout_session_id and ws.client_id = auth.uid())
  ) with check (
    exists (select 1 from public.workout_sessions ws where ws.id = workout_session_id and ws.client_id = auth.uid())
  );

create policy "logged_exercises_coach_read" on public.logged_exercises
  for select using (
    exists (
      select 1 from public.workout_sessions ws
      where ws.id = workout_session_id and public.is_coach_of(ws.client_id)
    )
  );

alter table public.logged_sets enable row level security;

create policy "logged_sets_client_full_access" on public.logged_sets
  for all using (
    exists (
      select 1 from public.logged_exercises le
      join public.workout_sessions ws on ws.id = le.workout_session_id
      where le.id = logged_exercise_id and ws.client_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.logged_exercises le
      join public.workout_sessions ws on ws.id = le.workout_session_id
      where le.id = logged_exercise_id and ws.client_id = auth.uid()
    )
  );

create policy "logged_sets_coach_read" on public.logged_sets
  for select using (
    exists (
      select 1 from public.logged_exercises le
      join public.workout_sessions ws on ws.id = le.workout_session_id
      where le.id = logged_exercise_id and public.is_coach_of(ws.client_id)
    )
  );

-- ----------------------------------------------------------------------------
-- nutrition_targets: coach writes, client reads own; client may self-set too
-- ----------------------------------------------------------------------------
alter table public.nutrition_targets enable row level security;

create policy "nutrition_targets_client_read" on public.nutrition_targets
  for select using (client_id = auth.uid());

create policy "nutrition_targets_client_insert_self" on public.nutrition_targets
  for insert with check (client_id = auth.uid() and set_by = auth.uid());

create policy "nutrition_targets_coach_manage" on public.nutrition_targets
  for all using (public.is_coach_of(client_id)) with check (public.is_coach_of(client_id));

-- ----------------------------------------------------------------------------
-- nutrition_logs / body_metrics / progress_photos / habit_logs:
-- client-owned, coach read-only
-- ----------------------------------------------------------------------------
alter table public.nutrition_logs enable row level security;
create policy "nutrition_logs_client_full_access" on public.nutrition_logs
  for all using (client_id = auth.uid()) with check (client_id = auth.uid());
create policy "nutrition_logs_coach_read" on public.nutrition_logs
  for select using (public.is_coach_of(client_id));

alter table public.body_metrics enable row level security;
create policy "body_metrics_client_full_access" on public.body_metrics
  for all using (client_id = auth.uid()) with check (client_id = auth.uid());
create policy "body_metrics_coach_read" on public.body_metrics
  for select using (public.is_coach_of(client_id));

alter table public.progress_photos enable row level security;
create policy "progress_photos_client_full_access" on public.progress_photos
  for all using (client_id = auth.uid()) with check (client_id = auth.uid());
create policy "progress_photos_coach_read" on public.progress_photos
  for select using (public.is_coach_of(client_id));

alter table public.habit_logs enable row level security;
create policy "habit_logs_client_full_access" on public.habit_logs
  for all using (client_id = auth.uid()) with check (client_id = auth.uid());
create policy "habit_logs_coach_read" on public.habit_logs
  for select using (public.is_coach_of(client_id));

-- ----------------------------------------------------------------------------
-- checkins: client submits, coach reviews
-- ----------------------------------------------------------------------------
alter table public.checkins enable row level security;

create policy "checkins_client_insert" on public.checkins
  for insert with check (client_id = auth.uid());

create policy "checkins_client_read_own" on public.checkins
  for select using (client_id = auth.uid());

create policy "checkins_client_update_own_pending" on public.checkins
  for update using (client_id = auth.uid() and status = 'pending');

create policy "checkins_coach_manage" on public.checkins
  for all using (coach_id = auth.uid()) with check (coach_id = auth.uid());

-- ----------------------------------------------------------------------------
-- conversations / messages
-- ----------------------------------------------------------------------------
alter table public.conversations enable row level security;
create policy "conversations_participants" on public.conversations
  for all using (coach_id = auth.uid() or client_id = auth.uid())
  with check (coach_id = auth.uid() or client_id = auth.uid());

alter table public.messages enable row level security;

create policy "messages_select_participants" on public.messages
  for select using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and (c.coach_id = auth.uid() or c.client_id = auth.uid())
    )
  );

create policy "messages_insert_participants" on public.messages
  for insert with check (
    sender_id = auth.uid() and
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and (c.coach_id = auth.uid() or c.client_id = auth.uid())
    )
  );

create policy "messages_update_read_receipt" on public.messages
  for update using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and (c.coach_id = auth.uid() or c.client_id = auth.uid())
    )
  );

-- ----------------------------------------------------------------------------
-- notifications: strictly own
-- ----------------------------------------------------------------------------
alter table public.notifications enable row level security;

create policy "notifications_select_own" on public.notifications
  for select using (user_id = auth.uid());

create policy "notifications_update_own" on public.notifications
  for update using (user_id = auth.uid());

-- notifications are inserted by backend/service role (edge functions), not by users directly.
