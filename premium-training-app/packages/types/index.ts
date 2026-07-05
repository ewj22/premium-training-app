/**
 * Hand-written domain types shared between apps/mobile and apps/web.
 * These are *view models* — shaped for UI consumption — as opposed to
 * database.types.ts (raw generated table rows). Keeping them separate means
 * a schema column rename doesn't ripple through every component prop.
 */

export type UserRole = "client" | "coach" | "admin";

export interface Profile {
  id: string;
  role: UserRole;
  fullName: string;
  avatarUrl: string | null;
  onboardingCompleted: boolean;
}

export interface ExerciseSummary {
  id: string;
  name: string;
  primaryMuscle: string;
  equipment: string | null;
  thumbnailUrl: string | null;
  videoUrl: string | null;
}

export interface LoggedSetInput {
  setNumber: number;
  weightKg: number | null;
  reps: number | null;
  rpe: number | null;
  setType: "normal" | "warmup" | "dropset" | "failure" | "amrap";
  completed: boolean;
}

export interface WorkoutSessionSummary {
  id: string;
  title: string;
  status: "draft" | "scheduled" | "completed" | "skipped";
  scheduledDate: string | null;
  completedAt: string | null;
  durationSeconds: number | null;
}

export interface NutritionTargets {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface CheckinSummary {
  id: string;
  weekStartDate: string;
  status: "pending" | "submitted" | "reviewed";
  weightKg: number | null;
  adherencePct: number | null;
}
