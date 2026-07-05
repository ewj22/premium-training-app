import { supabase } from "@shared/lib/supabase";
import type { HabitType, MealLog, NutritionTargets, WeightEntry } from "../types";

const todayStr = () => new Date().toISOString().slice(0, 10);

// ----------------------------------------------------------------------------
// Targets
// ----------------------------------------------------------------------------

export async function fetchLatestTargets(clientId: string): Promise<NutritionTargets | null> {
  const { data, error } = await supabase
    .from("nutrition_targets")
    .select("calories, protein_g, carbs_g, fat_g")
    .eq("client_id", clientId)
    .lte("effective_date", todayStr())
    .order("effective_date", { ascending: false })
    .limit(1);

  if (error) throw error;
  const row = data?.[0];
  if (!row) return null;

  return { calories: row.calories, proteinG: row.protein_g, carbsG: row.carbs_g, fatG: row.fat_g };
}

/** Client self-sets targets when no coach has set any yet (RLS allows this explicitly). */
export async function setSelfTargets(clientId: string, targets: NutritionTargets) {
  const { error } = await supabase.from("nutrition_targets").insert({
    client_id: clientId,
    set_by: clientId,
    calories: targets.calories,
    protein_g: targets.proteinG,
    carbs_g: targets.carbsG,
    fat_g: targets.fatG,
    effective_date: todayStr(),
  });
  if (error) throw error;
}

// ----------------------------------------------------------------------------
// Meal logs
// ----------------------------------------------------------------------------

export async function fetchTodayMeals(clientId: string): Promise<MealLog[]> {
  const { data, error } = await supabase
    .from("nutrition_logs")
    .select("id, meal_name, calories, protein_g, carbs_g, fat_g, logged_date")
    .eq("client_id", clientId)
    .eq("logged_date", todayStr())
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    mealName: row.meal_name,
    calories: row.calories,
    proteinG: row.protein_g,
    carbsG: row.carbs_g,
    fatG: row.fat_g,
    loggedDate: row.logged_date,
  }));
}

export interface AddMealInput {
  clientId: string;
  mealName: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export async function addMealLog(input: AddMealInput) {
  const { error } = await supabase.from("nutrition_logs").insert({
    client_id: input.clientId,
    meal_name: input.mealName,
    calories: input.calories,
    protein_g: input.proteinG,
    carbs_g: input.carbsG,
    fat_g: input.fatG,
    logged_date: todayStr(),
  });
  if (error) throw error;
}

export async function deleteMealLog(logId: string) {
  const { error } = await supabase.from("nutrition_logs").delete().eq("id", logId);
  if (error) throw error;
}

// ----------------------------------------------------------------------------
// Habits (steps / water / sleep)
// ----------------------------------------------------------------------------

export async function fetchTodayHabits(clientId: string) {
  const { data, error } = await supabase
    .from("habit_logs")
    .select("habit_type, value, target")
    .eq("client_id", clientId)
    .eq("logged_date", todayStr());

  if (error) throw error;

  const map: Record<HabitType, { value: number; target: number | null }> = {
    steps: { value: 0, target: 10000 },
    water: { value: 0, target: 2000 },
    sleep: { value: 0, target: 8 },
  };
  for (const row of data ?? []) {
    map[row.habit_type as HabitType] = { value: row.value, target: row.target };
  }
  return map;
}

export async function upsertHabit(
  clientId: string,
  habitType: HabitType,
  value: number,
  target: number | null
) {
  const { error } = await supabase.from("habit_logs").upsert(
    {
      client_id: clientId,
      habit_type: habitType,
      logged_date: todayStr(),
      value,
      target,
    },
    { onConflict: "client_id,habit_type,logged_date" }
  );
  if (error) throw error;
}

// ----------------------------------------------------------------------------
// Weight
// ----------------------------------------------------------------------------

export async function fetchRecentWeights(clientId: string, limit = 10): Promise<WeightEntry[]> {
  const { data, error } = await supabase
    .from("body_metrics")
    .select("id, weight_kg, recorded_date")
    .eq("client_id", clientId)
    .not("weight_kg", "is", null)
    .order("recorded_date", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    weightKg: row.weight_kg,
    recordedDate: row.recorded_date,
  }));
}

export async function logWeight(clientId: string, weightKg: number) {
  const { error } = await supabase.from("body_metrics").upsert(
    {
      client_id: clientId,
      recorded_date: todayStr(),
      weight_kg: weightKg,
    },
    { onConflict: "client_id,recorded_date" }
  );
  if (error) throw error;
}
