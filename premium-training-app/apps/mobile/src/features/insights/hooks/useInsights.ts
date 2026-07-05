import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useProfile } from "@shared/lib/authStore";
import * as api from "../api/insightsApi";

export function useCompliance() {
  const profile = useProfile();
  return useQuery({
    queryKey: ["compliance", profile?.id],
    queryFn: () => api.calculateWeeklyCompliance(profile!.id),
    enabled: !!profile?.id,
    staleTime: 1000 * 60 * 5,
  });
}

export function useStreaks() {
  const profile = useProfile();
  return useQuery({
    queryKey: ["streaks", profile?.id],
    queryFn: () => api.fetchStreaks(profile!.id),
    enabled: !!profile?.id,
  });
}

export function useUpdateStreak() {
  const profile = useProfile();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (streakType: string) => api.updateStreak(profile!.id, streakType),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["streaks", profile?.id] }),
  });
}

export function useAchievements() {
  const profile = useProfile();
  return useQuery({
    queryKey: ["achievements", profile?.id],
    queryFn: () => api.fetchAchievements(profile!.id),
    enabled: !!profile?.id,
  });
}

export function useCheckAchievements() {
  const profile = useProfile();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.checkAndAwardAchievements(profile!.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["achievements", profile?.id] }),
  });
}

export function useCoachInsights() {
  const profile = useProfile();
  return useQuery({
    queryKey: ["coach-insights", profile?.id],
    queryFn: () => api.generateCoachInsights(profile!.id),
    enabled: !!profile?.id,
    staleTime: 1000 * 60 * 10,
  });
}

export function useSmartProgressions() {
  const profile = useProfile();
  return useQuery({
    queryKey: ["smart-progressions", profile?.id],
    queryFn: () => api.getSmartProgressions(profile!.id),
    enabled: !!profile?.id,
  });
}

export function useWeeklyReview() {
  const profile = useProfile();
  return useQuery({
    queryKey: ["weekly-review", profile?.id],
    queryFn: () => api.generateWeeklyReview(profile!.id),
    enabled: !!profile?.id,
    staleTime: 1000 * 60 * 5,
  });
}

export function useExerciseSubstitutions(exerciseId: string | undefined) {
  return useQuery({
    queryKey: ["exercise-subs", exerciseId],
    queryFn: () => api.fetchSubstitutions(exerciseId!),
    enabled: !!exerciseId,
  });
}
