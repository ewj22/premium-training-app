import { supabase } from "@shared/lib/supabase";

const todayStr = () => new Date().toISOString().slice(0, 10);
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

// ============================================================================
// COMPLIANCE SCORE
// ============================================================================

export interface ComplianceBreakdown {
  overall: number;
  workouts: number;
  calories: number;
  protein: number;
  steps: number;
  water: number;
  checkins: number;
  summary: string;
}

export async function calculateWeeklyCompliance(clientId: string): Promise<ComplianceBreakdown> {
  const weekStart = daysAgo(7);

  // Workouts completed this week
  const { data: workouts } = await supabase
    .from("workout_sessions")
    .select("id")
    .eq("client_id", clientId)
    .eq("status", "completed")
    .gte("scheduled_date", weekStart);
  const workoutScore = Math.min(((workouts?.length ?? 0) / 4) * 100, 100);

  // Nutrition logs this week (days with calories logged)
  const { data: nutritionLogs } = await supabase
    .from("nutrition_logs")
    .select("logged_date")
    .eq("client_id", clientId)
    .gte("logged_date", weekStart);
  const uniqueNutritionDays = new Set((nutritionLogs ?? []).map((r) => r.logged_date)).size;

  // Get targets
  const { data: targets } = await supabase
    .from("nutrition_targets")
    .select("calories, protein_g")
    .eq("client_id", clientId)
    .order("effective_date", { ascending: false })
    .limit(1);
  const target = targets?.[0];

  // Calculate average daily nutrition
  const dailyTotals = new Map<string, { cal: number; pro: number }>();
  for (const log of nutritionLogs ?? []) {
    const existing = dailyTotals.get(log.logged_date) ?? { cal: 0, pro: 0 };
    existing.cal += (log as any).calories ?? 0;
    existing.pro += (log as any).protein_g ?? 0;
    dailyTotals.set(log.logged_date, existing);
  }

  let calorieScore = uniqueNutritionDays > 0 ? (uniqueNutritionDays / 7) * 100 : 0;
  let proteinScore = calorieScore; // Simplified: tracked = compliant

  // Habits this week
  const { data: habits } = await supabase
    .from("habit_logs")
    .select("habit_type, value, target")
    .eq("client_id", clientId)
    .gte("logged_date", weekStart);

  const stepDays = (habits ?? []).filter((h) => h.habit_type === "steps" && h.value >= (h.target ?? 10000)).length;
  const waterDays = (habits ?? []).filter((h) => h.habit_type === "water" && h.value >= (h.target ?? 2000)).length;
  const stepsScore = (stepDays / 7) * 100;
  const waterScore = (waterDays / 7) * 100;

  // Check-ins this week
  const { data: checkins } = await supabase
    .from("checkins")
    .select("id")
    .eq("client_id", clientId)
    .gte("week_start_date", weekStart);
  const checkinScore = (checkins?.length ?? 0) > 0 ? 100 : 0;

  const overall = Math.round(
    (workoutScore * 0.3 + calorieScore * 0.2 + proteinScore * 0.15 + stepsScore * 0.15 + waterScore * 0.1 + checkinScore * 0.1)
  );

  // Generate summary
  const strengths: string[] = [];
  const improvements: string[] = [];
  if (workoutScore >= 75) strengths.push("workout consistency");
  else improvements.push("workout frequency");
  if (calorieScore >= 70) strengths.push("nutrition tracking");
  else improvements.push("nutrition logging");
  if (stepsScore >= 70) strengths.push("daily steps");
  else improvements.push("daily activity");

  const summary = strengths.length > 0
    ? `Strong ${strengths.join(" and ")}. ${improvements.length > 0 ? `Focus on ${improvements.join(" and ")}.` : "Keep it up!"}`
    : `Focus on ${improvements.join(", ")} this week.`;

  return {
    overall,
    workouts: Math.round(workoutScore),
    calories: Math.round(calorieScore),
    protein: Math.round(proteinScore),
    steps: Math.round(stepsScore),
    water: Math.round(waterScore),
    checkins: Math.round(checkinScore),
    summary,
  };
}

// ============================================================================
// STREAKS
// ============================================================================

export interface StreakData {
  streakType: string;
  currentCount: number;
  longestCount: number;
  lastLoggedDate: string | null;
}

export async function fetchStreaks(clientId: string): Promise<StreakData[]> {
  const { data, error } = await supabase
    .from("streaks")
    .select("streak_type, current_count, longest_count, last_logged_date")
    .eq("client_id", clientId);
  if (error) throw error;
  return (data ?? []).map((r) => ({
    streakType: r.streak_type,
    currentCount: r.current_count,
    longestCount: r.longest_count,
    lastLoggedDate: r.last_logged_date,
  }));
}

export async function updateStreak(clientId: string, streakType: string) {
  const today = todayStr();
  const yesterday = daysAgo(1);

  const { data: existing } = await supabase
    .from("streaks")
    .select("*")
    .eq("client_id", clientId)
    .eq("streak_type", streakType)
    .single();

  if (!existing) {
    await supabase.from("streaks").insert({
      client_id: clientId, streak_type: streakType,
      current_count: 1, longest_count: 1, last_logged_date: today,
    });
    return;
  }

  if (existing.last_logged_date === today) return; // Already logged today

  const newCount = existing.last_logged_date === yesterday
    ? existing.current_count + 1
    : 1; // Streak broken, restart

  const newLongest = Math.max(newCount, existing.longest_count);

  await supabase.from("streaks").update({
    current_count: newCount, longest_count: newLongest, last_logged_date: today,
  }).eq("id", existing.id);
}

// ============================================================================
// ACHIEVEMENTS
// ============================================================================

export interface Achievement {
  badgeKey: string;
  earnedAt: string;
}

export const BADGE_DEFINITIONS: Record<string, { title: string; emoji: string; description: string }> = {
  first_workout: { title: "First Workout", emoji: "🏋️", description: "Completed your first workout" },
  ten_workouts: { title: "10 Workouts", emoji: "💪", description: "Completed 10 workouts" },
  fifty_workouts: { title: "50 Workouts", emoji: "🔥", description: "Completed 50 workouts" },
  hundred_workouts: { title: "Century Club", emoji: "💯", description: "Completed 100 workouts" },
  seven_day_streak: { title: "7 Day Streak", emoji: "⚡", description: "Worked out 7 days in a row" },
  thirty_day_streak: { title: "30 Day Streak", emoji: "🌟", description: "Worked out 30 days in a row" },
  first_pb: { title: "First PB", emoji: "🏆", description: "Set your first personal best" },
  ten_pbs: { title: "PB Hunter", emoji: "🎯", description: "Set 10 personal bests" },
  first_checkin: { title: "Check-in Pro", emoji: "✅", description: "Submitted your first weekly check-in" },
  perfect_week: { title: "Perfect Week", emoji: "⭐", description: "100% compliance in a week" },
  nutrition_streak_7: { title: "Fuel Master", emoji: "🥗", description: "Logged nutrition 7 days straight" },
};

export async function fetchAchievements(clientId: string): Promise<Achievement[]> {
  const { data, error } = await supabase
    .from("achievements")
    .select("badge_key, earned_at")
    .eq("client_id", clientId)
    .order("earned_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({ badgeKey: r.badge_key, earnedAt: r.earned_at }));
}

export async function checkAndAwardAchievements(clientId: string): Promise<string[]> {
  const newBadges: string[] = [];

  // Fetch existing achievements
  const { data: existing } = await supabase
    .from("achievements").select("badge_key").eq("client_id", clientId);
  const earned = new Set((existing ?? []).map((r) => r.badge_key));

  // Count completed workouts
  const { count: workoutCount } = await supabase
    .from("workout_sessions")
    .select("id", { count: "exact", head: true })
    .eq("client_id", clientId)
    .eq("status", "completed");

  const wc = workoutCount ?? 0;
  if (wc >= 1 && !earned.has("first_workout")) newBadges.push("first_workout");
  if (wc >= 10 && !earned.has("ten_workouts")) newBadges.push("ten_workouts");
  if (wc >= 50 && !earned.has("fifty_workouts")) newBadges.push("fifty_workouts");
  if (wc >= 100 && !earned.has("hundred_workouts")) newBadges.push("hundred_workouts");

  // Count PBs
  const { count: pbCount } = await supabase
    .from("logged_sets")
    .select("id", { count: "exact", head: true })
    .eq("is_personal_best", true);
  if ((pbCount ?? 0) >= 1 && !earned.has("first_pb")) newBadges.push("first_pb");
  if ((pbCount ?? 0) >= 10 && !earned.has("ten_pbs")) newBadges.push("ten_pbs");

  // Check streaks
  const { data: streaks } = await supabase
    .from("streaks").select("streak_type, longest_count").eq("client_id", clientId);
  for (const s of streaks ?? []) {
    if (s.streak_type === "workout" && s.longest_count >= 7 && !earned.has("seven_day_streak")) newBadges.push("seven_day_streak");
    if (s.streak_type === "workout" && s.longest_count >= 30 && !earned.has("thirty_day_streak")) newBadges.push("thirty_day_streak");
  }

  // Check check-ins
  const { count: checkinCount } = await supabase
    .from("checkins").select("id", { count: "exact", head: true })
    .eq("client_id", clientId).in("status", ["submitted", "reviewed"]);
  if ((checkinCount ?? 0) >= 1 && !earned.has("first_checkin")) newBadges.push("first_checkin");

  // Award new badges
  if (newBadges.length > 0) {
    await supabase.from("achievements").insert(
      newBadges.map((key) => ({ client_id: clientId, badge_key: key }))
    );
  }

  return newBadges;
}

// ============================================================================
// COACH INSIGHTS — computed analysis from training data
// ============================================================================

export interface CoachInsight {
  type: "strength_gain" | "consistency" | "plateau" | "volume" | "recommendation";
  message: string;
  priority: "high" | "medium" | "low";
}

export async function generateCoachInsights(clientId: string): Promise<CoachInsight[]> {
  const insights: CoachInsight[] = [];
  const eightWeeksAgo = daysAgo(56);
  const fourWeeksAgo = daysAgo(28);

  // Fetch recent workout data
  const { data: recentSessions } = await supabase
    .from("workout_sessions")
    .select("id, completed_at, scheduled_date")
    .eq("client_id", clientId)
    .eq("status", "completed")
    .gte("scheduled_date", eightWeeksAgo)
    .order("scheduled_date", { ascending: true });

  const totalSessions = recentSessions?.length ?? 0;

  // Consistency insight
  const last4WeekSessions = (recentSessions ?? []).filter(
    (s) => s.scheduled_date && s.scheduled_date >= fourWeeksAgo
  ).length;
  const prev4WeekSessions = totalSessions - last4WeekSessions;

  if (last4WeekSessions > prev4WeekSessions && prev4WeekSessions > 0) {
    insights.push({
      type: "consistency",
      message: `Training consistency has improved — ${last4WeekSessions} sessions in the last 4 weeks vs ${prev4WeekSessions} before that.`,
      priority: "medium",
    });
  } else if (last4WeekSessions < prev4WeekSessions && prev4WeekSessions > 0) {
    insights.push({
      type: "consistency",
      message: `Training frequency has dropped — ${last4WeekSessions} sessions recently vs ${prev4WeekSessions} before. Try to stay consistent.`,
      priority: "high",
    });
  }

  // Strength gains per exercise (compare avg weight first 2 weeks vs last 2 weeks)
  const { data: allSets } = await supabase
    .from("logged_sets")
    .select("weight_kg, reps, completed_at, logged_exercises!inner(exercise_id, exercises(name), workout_sessions!inner(client_id, scheduled_date))")
    .eq("logged_exercises.workout_sessions.client_id", clientId)
    .eq("completed", true)
    .gte("logged_exercises.workout_sessions.scheduled_date", eightWeeksAgo);

  // Group by exercise
  const byExercise = new Map<string, { name: string; early: number[]; recent: number[] }>();
  for (const set of allSets ?? []) {
    const ex = (set as any).logged_exercises;
    const eid = ex.exercise_id;
    const date = ex.workout_sessions?.scheduled_date;
    if (!date || !set.weight_kg) continue;

    if (!byExercise.has(eid)) {
      byExercise.set(eid, { name: ex.exercises?.name ?? "Exercise", early: [], recent: [] });
    }
    const entry = byExercise.get(eid)!;
    if (date < fourWeeksAgo) entry.early.push(set.weight_kg);
    else entry.recent.push(set.weight_kg);
  }

  for (const [_eid, data] of byExercise) {
    if (data.early.length < 2 || data.recent.length < 2) continue;
    const earlyAvg = data.early.reduce((a, b) => a + b, 0) / data.early.length;
    const recentAvg = data.recent.reduce((a, b) => a + b, 0) / data.recent.length;
    const pctChange = ((recentAvg - earlyAvg) / earlyAvg) * 100;

    if (pctChange > 5) {
      insights.push({
        type: "strength_gain",
        message: `${data.name} strength increased by ${Math.round(pctChange)}% over 8 weeks.`,
        priority: "medium",
      });
    } else if (pctChange < -3) {
      insights.push({
        type: "plateau",
        message: `${data.name} weight has decreased by ${Math.abs(Math.round(pctChange))}%. Consider reviewing form or recovery.`,
        priority: "high",
      });
    } else if (data.recent.length >= 4 && Math.abs(pctChange) < 2) {
      insights.push({
        type: "plateau",
        message: `${data.name} has plateaued — weight unchanged for 4+ weeks. Try varying rep ranges or adding volume.`,
        priority: "medium",
      });
    }
  }

  // Weight trend insight
  const { data: weights } = await supabase
    .from("body_metrics")
    .select("weight_kg, recorded_date")
    .eq("client_id", clientId)
    .not("weight_kg", "is", null)
    .order("recorded_date", { ascending: false })
    .limit(8);

  if (weights && weights.length >= 4) {
    const recentW = weights.slice(0, 2).reduce((a, r) => a + (r.weight_kg ?? 0), 0) / 2;
    const olderW = weights.slice(-2).reduce((a, r) => a + (r.weight_kg ?? 0), 0) / 2;
    const wChange = recentW - olderW;

    if (Math.abs(wChange) < 0.3 && totalSessions > 0) {
      insights.push({
        type: "recommendation",
        message: "Weight is stable while training consistently — likely recomping. Great progress.",
        priority: "low",
      });
    } else if (wChange > 1) {
      insights.push({
        type: "recommendation",
        message: `Weight is up ${wChange.toFixed(1)}kg recently. Review calorie intake if fat loss is the goal.`,
        priority: "medium",
      });
    }
  }

  return insights.sort((a, b) => {
    const p = { high: 0, medium: 1, low: 2 };
    return p[a.priority] - p[b.priority];
  });
}

// ============================================================================
// SMART PROGRESSION — suggest next session weights
// ============================================================================

export interface ProgressionSuggestion {
  exerciseId: string;
  exerciseName: string;
  lastWeight: number;
  lastReps: number[];
  suggestedWeight: number;
  suggestedReps: string;
  reason: string;
}

export async function getSmartProgressions(clientId: string): Promise<ProgressionSuggestion[]> {
  // Get the most recent completed session's exercises
  const { data: lastSession } = await supabase
    .from("workout_sessions")
    .select("id")
    .eq("client_id", clientId)
    .eq("status", "completed")
    .order("completed_at", { ascending: false })
    .limit(1);

  if (!lastSession?.length) return [];

  const { data: exercises } = await supabase
    .from("logged_exercises")
    .select("exercise_id, exercises(name), logged_sets(weight_kg, reps, completed)")
    .eq("workout_session_id", lastSession[0].id);

  const suggestions: ProgressionSuggestion[] = [];

  for (const ex of exercises ?? []) {
    const completedSets = ((ex as any).logged_sets ?? []).filter((s: any) => s.completed && s.weight_kg);
    if (completedSets.length === 0) continue;

    const weight = completedSets[0].weight_kg;
    const reps = completedSets.map((s: any) => s.reps ?? 0);
    const avgReps = reps.reduce((a: number, b: number) => a + b, 0) / reps.length;
    const allHitTop = reps.every((r: number) => r >= 12); // Top of typical 8-12 range
    const allHitMin = reps.every((r: number) => r >= 8);
    const anyFailed = reps.some((r: number) => r < 6);

    let suggestedWeight = weight;
    let suggestedReps = "8-12";
    let reason = "";

    if (allHitTop) {
      suggestedWeight = weight + 2.5;
      suggestedReps = "8-12";
      reason = `Hit top of rep range (${reps.join(", ")}) — increase weight`;
    } else if (allHitMin) {
      suggestedWeight = weight;
      suggestedReps = "aim for more reps";
      reason = `Solid reps (${reps.join(", ")}) — maintain weight, push for more`;
    } else if (anyFailed) {
      // Check if failed twice (look at previous session too)
      suggestedWeight = weight - 2.5;
      suggestedReps = "8-12";
      reason = `Struggled with reps (${reps.join(", ")}) — reduce weight slightly`;
    } else {
      suggestedWeight = weight;
      suggestedReps = "8-12";
      reason = "Maintain current weight and build consistency";
    }

    suggestions.push({
      exerciseId: (ex as any).exercise_id,
      exerciseName: (ex as any).exercises?.name ?? "Exercise",
      lastWeight: weight,
      lastReps: reps,
      suggestedWeight: Math.max(0, suggestedWeight),
      suggestedReps,
      reason,
    });
  }

  return suggestions;
}

// ============================================================================
// WEEKLY REVIEW
// ============================================================================

export interface WeeklyReview {
  workoutsCompleted: number;
  caloriesAvg: number;
  proteinAvg: number;
  weightChange: number | null;
  bestLift: { exercise: string; weight: number; reps: number } | null;
  newPBs: number;
  complianceScore: number;
}

export async function generateWeeklyReview(clientId: string): Promise<WeeklyReview> {
  const weekStart = daysAgo(7);

  const { data: workouts } = await supabase
    .from("workout_sessions").select("id")
    .eq("client_id", clientId).eq("status", "completed").gte("scheduled_date", weekStart);

  const { data: nutrition } = await supabase
    .from("nutrition_logs").select("calories, protein_g, logged_date")
    .eq("client_id", clientId).gte("logged_date", weekStart);

  const uniqueDays = new Set((nutrition ?? []).map((n) => n.logged_date)).size;
  const totalCal = (nutrition ?? []).reduce((a, n) => a + (n.calories ?? 0), 0);
  const totalPro = (nutrition ?? []).reduce((a, n) => a + (n.protein_g ?? 0), 0);

  const { data: weights } = await supabase
    .from("body_metrics").select("weight_kg, recorded_date")
    .eq("client_id", clientId).not("weight_kg", "is", null)
    .order("recorded_date", { ascending: false }).limit(2);

  const weightChange = weights && weights.length >= 2
    ? (weights[0].weight_kg ?? 0) - (weights[1].weight_kg ?? 0) : null;

  // Best lift this week
  const { data: pbs } = await supabase
    .from("logged_sets")
    .select("weight_kg, reps, logged_exercises!inner(exercises(name), workout_sessions!inner(client_id, scheduled_date))")
    .eq("logged_exercises.workout_sessions.client_id", clientId)
    .eq("is_personal_best", true)
    .gte("logged_exercises.workout_sessions.scheduled_date", weekStart)
    .order("weight_kg", { ascending: false });

  const bestLift = pbs && pbs.length > 0
    ? { exercise: (pbs[0] as any).logged_exercises?.exercises?.name ?? "", weight: pbs[0].weight_kg ?? 0, reps: pbs[0].reps ?? 0 }
    : null;

  const compliance = await calculateWeeklyCompliance(clientId);

  return {
    workoutsCompleted: workouts?.length ?? 0,
    caloriesAvg: uniqueDays > 0 ? Math.round(totalCal / uniqueDays) : 0,
    proteinAvg: uniqueDays > 0 ? Math.round(totalPro / uniqueDays) : 0,
    weightChange,
    bestLift,
    newPBs: pbs?.length ?? 0,
    complianceScore: compliance.overall,
  };
}

// ============================================================================
// EXERCISE SUBSTITUTIONS
// ============================================================================

export interface SubstituteExercise {
  id: string;
  name: string;
  equipment: string | null;
  primaryMuscle: string;
}

export async function fetchSubstitutions(exerciseId: string): Promise<SubstituteExercise[]> {
  const { data, error } = await supabase
    .from("exercise_substitutions")
    .select("substitute_id, exercises!exercise_substitutions_substitute_id_fkey(id, name, equipment, primary_muscle)")
    .eq("exercise_id", exerciseId);

  if (error) throw error;

  // Also check reverse direction
  const { data: reverse } = await supabase
    .from("exercise_substitutions")
    .select("exercise_id, exercises!exercise_substitutions_exercise_id_fkey(id, name, equipment, primary_muscle)")
    .eq("substitute_id", exerciseId);

  const results: SubstituteExercise[] = [];
  const seen = new Set<string>();

  for (const row of data ?? []) {
    const ex = (row as any).exercises;
    if (ex && !seen.has(ex.id)) {
      seen.add(ex.id);
      results.push({ id: ex.id, name: ex.name, equipment: ex.equipment, primaryMuscle: ex.primary_muscle });
    }
  }
  for (const row of reverse ?? []) {
    const ex = (row as any).exercises;
    if (ex && !seen.has(ex.id)) {
      seen.add(ex.id);
      results.push({ id: ex.id, name: ex.name, equipment: ex.equipment, primaryMuscle: ex.primary_muscle });
    }
  }

  return results;
}
