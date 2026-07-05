import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useProfile } from "@shared/lib/authStore";
import * as api from "../api/nutritionApi";
import type { HabitType, NutritionTargets } from "../types";

export function useTargets() {
  const profile = useProfile();
  return useQuery({
    queryKey: ["nutrition-targets", profile?.id],
    queryFn: () => api.fetchLatestTargets(profile!.id),
    enabled: !!profile?.id,
  });
}

export function useSetSelfTargets() {
  const profile = useProfile();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (targets: NutritionTargets) => api.setSelfTargets(profile!.id, targets),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["nutrition-targets", profile?.id] }),
  });
}

export function useTodayMeals() {
  const profile = useProfile();
  return useQuery({
    queryKey: ["nutrition-logs-today", profile?.id],
    queryFn: () => api.fetchTodayMeals(profile!.id),
    enabled: !!profile?.id,
  });
}

export function useAddMeal() {
  const profile = useProfile();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<api.AddMealInput, "clientId">) =>
      api.addMealLog({ ...input, clientId: profile!.id }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["nutrition-logs-today", profile?.id] }),
  });
}

export function useDeleteMeal() {
  const profile = useProfile();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (logId: string) => api.deleteMealLog(logId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["nutrition-logs-today", profile?.id] }),
  });
}

export function useTodayHabits() {
  const profile = useProfile();
  return useQuery({
    queryKey: ["habits-today", profile?.id],
    queryFn: () => api.fetchTodayHabits(profile!.id),
    enabled: !!profile?.id,
  });
}

export function useUpsertHabit() {
  const profile = useProfile();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      habitType,
      value,
      target,
    }: {
      habitType: HabitType;
      value: number;
      target: number | null;
    }) => api.upsertHabit(profile!.id, habitType, value, target),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["habits-today", profile?.id] }),
  });
}

export function useRecentWeights() {
  const profile = useProfile();
  return useQuery({
    queryKey: ["weights-recent", profile?.id],
    queryFn: () => api.fetchRecentWeights(profile!.id),
    enabled: !!profile?.id,
  });
}

export function useLogWeight() {
  const profile = useProfile();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (weightKg: number) => api.logWeight(profile!.id, weightKg),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["weights-recent", profile?.id] }),
  });
}
