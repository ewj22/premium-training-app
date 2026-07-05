import { supabase } from "@shared/lib/supabase";
import type {
  ExerciseSummary,
  LoggedExerciseRow,
  LoggedSetRow,
  PreviousPerformance,
  WorkoutSessionRow,
} from "../types";

// ----------------------------------------------------------------------------
// Exercise library
// ----------------------------------------------------------------------------

export async function fetchExercises(searchTerm?: string): Promise<ExerciseSummary[]> {
  let query = supabase
    .from("exercises")
    .select("id, name, primary_muscle, equipment, exercise_categories(name)")
    .order("name");

  if (searchTerm) {
    query = query.ilike("name", `%${searchTerm}%`);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    name: row.name,
    primaryMuscle: row.primary_muscle,
    equipment: row.equipment,
    categoryName: row.exercise_categories?.name ?? null,
  }));
}

// ----------------------------------------------------------------------------
// Workout session lifecycle
// ----------------------------------------------------------------------------

/**
 * Creates a new session immediately in 'scheduled' status with the chosen
 * exercises attached. We create everything up-front (session + logged_exercise
 * rows) rather than lazily, so a set can be saved to the server the instant
 * it's logged — nothing is held only in memory during the workout.
 */
export async function startQuickWorkout(
  clientId: string,
  title: string,
  exerciseIds: string[]
): Promise<{ sessionId: string; loggedExercises: LoggedExerciseRow[] }> {
  const { data: session, error: sessionError } = await supabase
    .from("workout_sessions")
    .insert({
      client_id: clientId,
      title,
      status: "scheduled",
      scheduled_date: new Date().toISOString().slice(0, 10),
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (sessionError) throw sessionError;

  const rows = exerciseIds.map((exerciseId, index) => ({
    workout_session_id: session.id,
    exercise_id: exerciseId,
    sort_order: index,
  }));

  const { data: loggedExercises, error: leError } = await supabase
    .from("logged_exercises")
    .insert(rows)
    .select("id, exercise_id, sort_order, exercises(name)");

  if (leError) throw leError;

  return {
    sessionId: session.id,
    loggedExercises: (loggedExercises ?? []).map((row: any) => ({
      id: row.id,
      workoutSessionId: session.id,
      exerciseId: row.exercise_id,
      exerciseName: row.exercises?.name ?? "Exercise",
      sortOrder: row.sort_order,
      sets: [],
    })),
  };
}

export async function completeWorkoutSession(sessionId: string, durationSeconds: number) {
  const { error } = await supabase
    .from("workout_sessions")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      duration_seconds: durationSeconds,
    })
    .eq("id", sessionId);
  if (error) throw error;
}

export async function fetchWorkoutHistory(clientId: string): Promise<WorkoutSessionRow[]> {
  const { data, error } = await supabase
    .from("workout_sessions")
    .select("id, title, status, scheduled_date, started_at, completed_at, duration_seconds")
    .eq("client_id", clientId)
    .order("scheduled_date", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    title: row.title,
    status: row.status,
    scheduledDate: row.scheduled_date,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    durationSeconds: row.duration_seconds,
  }));
}

export async function fetchSessionDetail(sessionId: string): Promise<LoggedExerciseRow[]> {
  const { data, error } = await supabase
    .from("logged_exercises")
    .select(
      "id, exercise_id, sort_order, exercises(name), logged_sets(id, set_number, set_type, weight_kg, reps, rpe, is_personal_best, completed)"
    )
    .eq("workout_session_id", sessionId)
    .order("sort_order");

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    workoutSessionId: sessionId,
    exerciseId: row.exercise_id,
    exerciseName: row.exercises?.name ?? "Exercise",
    sortOrder: row.sort_order,
    sets: (row.logged_sets ?? [])
      .sort((a: any, b: any) => a.set_number - b.set_number)
      .map((s: any) => ({
        id: s.id,
        loggedExerciseId: row.id,
        setNumber: s.set_number,
        setType: s.set_type,
        weightKg: s.weight_kg,
        reps: s.reps,
        rpe: s.rpe,
        isPersonalBest: s.is_personal_best,
        completed: s.completed,
      })),
  }));
}

// ----------------------------------------------------------------------------
// Progressive overload: "what did I do last time" for a given exercise
// ----------------------------------------------------------------------------

export async function fetchPreviousPerformance(
  clientId: string,
  exerciseId: string
): Promise<PreviousPerformance> {
  // Find the most recent completed session that included this exercise.
  const { data, error } = await supabase
    .from("logged_exercises")
    .select(
      "workout_session_id, workout_sessions!inner(client_id, status, completed_at), logged_sets(weight_kg, reps, completed)"
    )
    .eq("exercise_id", exerciseId)
    .eq("workout_sessions.client_id", clientId)
    .eq("workout_sessions.status", "completed")
    .order("workout_sessions(completed_at)", { ascending: false })
    .limit(1);

  if (error) throw error;

  const last = data?.[0] as any;
  const lastSets = (last?.logged_sets ?? []).filter((s: any) => s.completed);

  const bestWeightKg = lastSets.length
    ? Math.max(...lastSets.map((s: any) => s.weight_kg ?? 0))
    : null;
  const bestSetAtBestWeight = lastSets.find((s: any) => s.weight_kg === bestWeightKg);

  return {
    exerciseId,
    bestWeightKg: bestWeightKg || null,
    bestReps: bestSetAtBestWeight?.reps ?? null,
    lastSessionDate: last?.workout_sessions?.completed_at ?? null,
    lastSets: lastSets.map((s: any) => ({ weightKg: s.weight_kg, reps: s.reps })),
  };
}

/**
 * All-time heaviest completed weight for this client+exercise. Used to
 * decide whether a newly logged set is a personal best.
 */
async function fetchAllTimeBestWeight(clientId: string, exerciseId: string): Promise<number> {
  const { data, error } = await supabase
    .from("logged_sets")
    .select("weight_kg, logged_exercises!inner(exercise_id, workout_sessions!inner(client_id))")
    .eq("logged_exercises.exercise_id", exerciseId)
    .eq("logged_exercises.workout_sessions.client_id", clientId)
    .eq("completed", true)
    .order("weight_kg", { ascending: false })
    .limit(1);

  if (error) throw error;
  return (data?.[0] as any)?.weight_kg ?? 0;
}

// ----------------------------------------------------------------------------
// Set logging
// ----------------------------------------------------------------------------

export interface SaveSetInput {
  loggedExerciseId: string;
  exerciseId: string;
  clientId: string;
  setNumber: number;
  setType: LoggedSetRow["setType"];
  weightKg: number | null;
  reps: number | null;
  rpe: number | null;
}

/**
 * Saves a completed set and determines PB status server-round-trip-free from
 * the caller's perspective (one extra read, one write) — checks the client's
 * all-time best for this exercise BEFORE inserting, so the comparison is
 * against history, not including the set we're about to save.
 */
export async function saveCompletedSet(input: SaveSetInput): Promise<LoggedSetRow> {
  const previousBest = await fetchAllTimeBestWeight(input.clientId, input.exerciseId);
  const isPersonalBest = (input.weightKg ?? 0) > previousBest && (input.weightKg ?? 0) > 0;

  const { data, error } = await supabase
    .from("logged_sets")
    .upsert(
      {
        logged_exercise_id: input.loggedExerciseId,
        set_number: input.setNumber,
        set_type: input.setType,
        weight_kg: input.weightKg,
        reps: input.reps,
        rpe: input.rpe,
        completed: true,
        completed_at: new Date().toISOString(),
        is_personal_best: isPersonalBest,
      },
      { onConflict: "logged_exercise_id,set_number" }
    )
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    loggedExerciseId: data.logged_exercise_id,
    setNumber: data.set_number,
    setType: data.set_type,
    weightKg: data.weight_kg,
    reps: data.reps,
    rpe: data.rpe,
    isPersonalBest: data.is_personal_best,
    completed: data.completed,
  };
}

// ----------------------------------------------------------------------------
// Personal bests — all-time best weight per exercise for this client
// ----------------------------------------------------------------------------

export interface PersonalBestRow {
  exerciseId: string;
  exerciseName: string;
  bestWeightKg: number;
  bestReps: number | null;
  achievedDate: string | null;
}

export async function fetchPersonalBests(clientId: string): Promise<PersonalBestRow[]> {
  const { data, error } = await supabase
    .from("logged_sets")
    .select("weight_kg, reps, completed_at, logged_exercises!inner(exercise_id, exercises(name), workout_sessions!inner(client_id))")
    .eq("logged_exercises.workout_sessions.client_id", clientId)
    .eq("is_personal_best", true)
    .eq("completed", true)
    .order("weight_kg", { ascending: false });

  if (error) throw error;

  // Deduplicate: keep only the heaviest PB per exercise
  const bestByExercise = new Map<string, PersonalBestRow>();
  for (const row of data ?? []) {
    const ex = (row as any).logged_exercises;
    const exerciseId = ex.exercise_id;
    if (!bestByExercise.has(exerciseId) || (row.weight_kg ?? 0) > (bestByExercise.get(exerciseId)!.bestWeightKg)) {
      bestByExercise.set(exerciseId, {
        exerciseId,
        exerciseName: ex.exercises?.name ?? "Exercise",
        bestWeightKg: row.weight_kg ?? 0,
        bestReps: row.reps,
        achievedDate: row.completed_at,
      });
    }
  }

  return Array.from(bestByExercise.values()).sort((a, b) => a.exerciseName.localeCompare(b.exerciseName));
}

// ----------------------------------------------------------------------------
// Exercise detail
// ----------------------------------------------------------------------------

export interface ExerciseDetail {
  id: string;
  name: string;
  primaryMuscle: string;
  secondaryMuscles: string[];
  equipment: string | null;
  instructions: string | null;
  videoUrl: string | null;
  categoryName: string | null;
}

export async function fetchExerciseDetail(exerciseId: string): Promise<ExerciseDetail> {
  const { data, error } = await supabase
    .from("exercises")
    .select("id, name, primary_muscle, secondary_muscles, equipment, instructions, video_url, exercise_categories(name)")
    .eq("id", exerciseId)
    .single();

  if (error) throw error;

  return {
    id: data.id,
    name: data.name,
    primaryMuscle: data.primary_muscle,
    secondaryMuscles: data.secondary_muscles ?? [],
    equipment: data.equipment,
    instructions: data.instructions,
    videoUrl: data.video_url,
    categoryName: (data as any).exercise_categories?.name ?? null,
  };
}

// ----------------------------------------------------------------------------
// Workout templates (client-saved, reusable workout configurations)
// ----------------------------------------------------------------------------

export interface WorkoutTemplate {
  id: string;
  title: string;
  exerciseNames: string[];
  exerciseIds: string[];
}

export async function fetchMyTemplates(clientId: string): Promise<WorkoutTemplate[]> {
  // We repurpose the programmes table for client-saved templates:
  // coach_id = clientId (the client is their own "coach" for personal templates)
  const { data, error } = await supabase
    .from("programmes")
    .select("id, title, workout_templates(id, title, workout_template_exercises(exercise_id, sort_order, exercises(name)))")
    .eq("coach_id", clientId)
    .eq("is_template", true)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((prog: any) => {
    const wt = prog.workout_templates?.[0];
    const exercises = (wt?.workout_template_exercises ?? [])
      .sort((a: any, b: any) => a.sort_order - b.sort_order);
    return {
      id: prog.id,
      title: prog.title,
      exerciseNames: exercises.map((e: any) => e.exercises?.name ?? "Exercise"),
      exerciseIds: exercises.map((e: any) => e.exercise_id),
    };
  });
}

export async function saveAsTemplate(
  clientId: string,
  title: string,
  exerciseIds: string[]
): Promise<void> {
  // Create programme
  const { data: prog, error: progError } = await supabase
    .from("programmes")
    .insert({ coach_id: clientId, title, is_template: true })
    .select()
    .single();

  if (progError) throw progError;

  // Create workout template
  const { data: wt, error: wtError } = await supabase
    .from("workout_templates")
    .insert({ programme_id: prog.id, title, day_order: 0 })
    .select()
    .single();

  if (wtError) throw wtError;

  // Add exercises
  const rows = exerciseIds.map((eid, i) => ({
    workout_template_id: wt.id,
    exercise_id: eid,
    sort_order: i,
  }));

  const { error: exError } = await supabase
    .from("workout_template_exercises")
    .insert(rows);

  if (exError) throw exError;
}

export async function deleteTemplate(templateId: string): Promise<void> {
  const { error } = await supabase.from("programmes").delete().eq("id", templateId);
  if (error) throw error;
}
