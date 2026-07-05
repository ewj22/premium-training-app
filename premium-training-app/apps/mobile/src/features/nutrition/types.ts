export interface NutritionTargets {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface MealLog {
  id: string;
  mealName: string | null;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  loggedDate: string;
}

export interface DailyTotals {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export type HabitType = "steps" | "water" | "sleep";

export interface HabitEntry {
  habitType: HabitType;
  value: number;
  target: number | null;
}

export interface WeightEntry {
  id: string;
  weightKg: number;
  recordedDate: string;
}
