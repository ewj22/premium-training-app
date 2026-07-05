-- Enables safely "saving" a set by (exercise, set number) without creating
-- duplicates if the user edits a set they already logged (e.g. corrects the
-- weight after saving). Required by the upsert in workoutsApi.saveCompletedSet.
alter table public.logged_sets
  add constraint logged_sets_exercise_setnum_unique unique (logged_exercise_id, set_number);
