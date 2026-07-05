import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useProfile } from "@shared/lib/authStore";
import * as api from "../api/workoutsApi";
import type { SaveSetInput } from "../api/workoutsApi";

export function useExercises(searchTerm?: string) {
  return useQuery({
    queryKey: ["exercises", searchTerm ?? ""],
    queryFn: () => api.fetchExercises(searchTerm),
  });
}

export function useWorkoutHistory() {
  const profile = useProfile();
  return useQuery({
    queryKey: ["workout-history", profile?.id],
    queryFn: () => api.fetchWorkoutHistory(profile!.id),
    enabled: !!profile?.id,
  });
}

export function useSessionDetail(sessionId: string | undefined) {
  return useQuery({
    queryKey: ["workout-session", sessionId],
    queryFn: () => api.fetchSessionDetail(sessionId!),
    enabled: !!sessionId,
  });
}

export function usePreviousPerformance(exerciseId: string | undefined) {
  const profile = useProfile();
  return useQuery({
    queryKey: ["previous-performance", profile?.id, exerciseId],
    queryFn: () => api.fetchPreviousPerformance(profile!.id, exerciseId!),
    enabled: !!profile?.id && !!exerciseId,
  });
}

export function useStartQuickWorkout() {
  const profile = useProfile();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { title: string; exerciseIds: string[] }) =>
      api.startQuickWorkout(profile!.id, input.title, input.exerciseIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workout-history", profile?.id] });
    },
  });
}

export function useSaveSet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SaveSetInput) => api.saveCompletedSet(input),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["workout-session"] });
      qc.invalidateQueries({ queryKey: ["previous-performance"] });
    },
  });
}

export function useCompleteWorkout() {
  const profile = useProfile();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { sessionId: string; durationSeconds: number }) =>
      api.completeWorkoutSession(input.sessionId, input.durationSeconds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workout-history", profile?.id] });
    },
  });
}

export function usePersonalBests() {
  const profile = useProfile();
  return useQuery({
    queryKey: ["personal-bests", profile?.id],
    queryFn: () => api.fetchPersonalBests(profile!.id),
    enabled: !!profile?.id,
  });
}

export function useExerciseDetail(exerciseId: string | undefined) {
  return useQuery({
    queryKey: ["exercise-detail", exerciseId],
    queryFn: () => api.fetchExerciseDetail(exerciseId!),
    enabled: !!exerciseId,
  });
}

export function useMyTemplates() {
  const profile = useProfile();
  return useQuery({
    queryKey: ["my-templates", profile?.id],
    queryFn: () => api.fetchMyTemplates(profile!.id),
    enabled: !!profile?.id,
  });
}

export function useSaveAsTemplate() {
  const profile = useProfile();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { title: string; exerciseIds: string[] }) =>
      api.saveAsTemplate(profile!.id, input.title, input.exerciseIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-templates", profile?.id] }),
  });
}

export function useDeleteTemplate() {
  const profile = useProfile();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (templateId: string) => api.deleteTemplate(templateId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-templates", profile?.id] }),
  });
}
