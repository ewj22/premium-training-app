import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useProfile } from "@shared/lib/authStore";
import * as api from "../api/progressApi";
import type { CheckinForm, ProgressPhoto } from "../types";

export function useProgressPhotos() {
  const profile = useProfile();
  return useQuery({
    queryKey: ["progress-photos", profile?.id],
    queryFn: () => api.fetchProgressPhotos(profile!.id),
    enabled: !!profile?.id,
  });
}

export function useUploadPhoto() {
  const profile = useProfile();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ fileUri, angle }: { fileUri: string; angle: ProgressPhoto["angle"] }) =>
      api.uploadProgressPhoto(profile!.id, fileUri, angle),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["progress-photos", profile?.id] }),
  });
}

export function useBodyMetrics() {
  const profile = useProfile();
  return useQuery({
    queryKey: ["body-metrics", profile?.id],
    queryFn: () => api.fetchBodyMetrics(profile!.id),
    enabled: !!profile?.id,
  });
}

export function useRecentCheckins() {
  const profile = useProfile();
  return useQuery({
    queryKey: ["checkins", profile?.id],
    queryFn: () => api.fetchRecentCheckins(profile!.id),
    enabled: !!profile?.id,
  });
}

export function useSubmitCheckin() {
  const profile = useProfile();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ coachId, form }: { coachId: string; form: CheckinForm }) =>
      api.submitCheckin(profile!.id, coachId, form),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["checkins", profile?.id] }),
  });
}
