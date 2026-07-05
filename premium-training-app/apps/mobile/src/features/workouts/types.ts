export interface ExerciseSummary {
  id: string;
  name: string;
  primaryMuscle: string;
  equipment: string | null;
  categoryName: string | null;
}

export interface LoggedSetRow {
  id: string;
  loggedExerciseId: string;
  setNumber: number;
  setType: "normal" | "warmup" | "dropset" | "failure" | "amrap";
  weightKg: number | null;
  reps: number | null;
  rpe: number | null;
  isPersonalBest: boolean;
  completed: boolean;
}

export interface LoggedExerciseRow {
  id: string;
  workoutSessionId: string;
  exerciseId: string;
  exerciseName: string;
  sortOrder: number;
  sets: LoggedSetRow[];
}

export interface WorkoutSessionRow {
  id: string;
  title: string;
  status: "draft" | "scheduled" | "completed" | "skipped";
  scheduledDate: string | null;
  startedAt: string | null;
  completedAt: string | null;
  durationSeconds: number | null;
}

export interface PreviousPerformance {
  exerciseId: string;
  bestWeightKg: number | null;
  bestReps: number | null;
  lastSessionDate: string | null;
  lastSets: { weightKg: number | null; reps: number | null }[];
}
