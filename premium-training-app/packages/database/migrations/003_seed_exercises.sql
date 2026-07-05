-- ============================================================================
-- SEED: exercise categories + a starter exercise library
-- Safe to run once. created_by is null -> these are global/system exercises,
-- visible to every user (is_public = true).
-- ============================================================================

insert into public.exercise_categories (name, sort_order) values
  ('Chest', 1),
  ('Back', 2),
  ('Legs', 3),
  ('Shoulders', 4),
  ('Arms', 5),
  ('Core', 6),
  ('Cardio', 7)
on conflict (name) do nothing;

-- Helper pattern: insert exercise referencing category by name lookup.
insert into public.exercises (category_id, name, primary_muscle, secondary_muscles, equipment, is_public)
select c.id, e.name, e.primary_muscle, e.secondary_muscles, e.equipment, true
from (values
  ('Chest', 'Barbell Bench Press', 'Chest', array['Triceps','Shoulders'], 'Barbell'),
  ('Chest', 'Incline Dumbbell Press', 'Chest', array['Shoulders','Triceps'], 'Dumbbell'),
  ('Chest', 'Push-Up', 'Chest', array['Triceps','Core'], 'Bodyweight'),
  ('Chest', 'Cable Fly', 'Chest', array['Shoulders'], 'Cable'),
  ('Back', 'Deadlift', 'Back', array['Glutes','Hamstrings','Core'], 'Barbell'),
  ('Back', 'Pull-Up', 'Back', array['Biceps','Shoulders'], 'Bodyweight'),
  ('Back', 'Barbell Row', 'Back', array['Biceps','Shoulders'], 'Barbell'),
  ('Back', 'Lat Pulldown', 'Back', array['Biceps'], 'Cable'),
  ('Legs', 'Barbell Back Squat', 'Quadriceps', array['Glutes','Hamstrings','Core'], 'Barbell'),
  ('Legs', 'Romanian Deadlift', 'Hamstrings', array['Glutes','Back'], 'Barbell'),
  ('Legs', 'Leg Press', 'Quadriceps', array['Glutes'], 'Machine'),
  ('Legs', 'Walking Lunge', 'Quadriceps', array['Glutes','Hamstrings'], 'Dumbbell'),
  ('Legs', 'Calf Raise', 'Calves', array[]::text[], 'Machine'),
  ('Shoulders', 'Overhead Press', 'Shoulders', array['Triceps','Core'], 'Barbell'),
  ('Shoulders', 'Lateral Raise', 'Shoulders', array[]::text[], 'Dumbbell'),
  ('Shoulders', 'Face Pull', 'Shoulders', array['Back'], 'Cable'),
  ('Arms', 'Barbell Curl', 'Biceps', array['Forearms'], 'Barbell'),
  ('Arms', 'Tricep Pushdown', 'Triceps', array[]::text[], 'Cable'),
  ('Arms', 'Hammer Curl', 'Biceps', array['Forearms'], 'Dumbbell'),
  ('Core', 'Plank', 'Core', array[]::text[], 'Bodyweight'),
  ('Core', 'Hanging Leg Raise', 'Core', array[]::text[], 'Bodyweight'),
  ('Core', 'Cable Crunch', 'Core', array[]::text[], 'Cable'),
  ('Cardio', 'Treadmill Run', 'Cardiovascular', array[]::text[], 'Machine'),
  ('Cardio', 'Rowing Machine', 'Cardiovascular', array['Back','Legs'], 'Machine')
) as e(category_name, name, primary_muscle, secondary_muscles, equipment)
join public.exercise_categories c on c.name = e.category_name
on conflict do nothing;
