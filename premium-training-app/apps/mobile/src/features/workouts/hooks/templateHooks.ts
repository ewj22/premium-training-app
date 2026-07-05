import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useProfile } from "@shared/lib/authStore";
import * as templateApi from "../api/templateApi";

export function useMyTemplates() {
  const profile = useProfile();
  return useQuery({
    queryKey: ["my-templates", profile?.id],
    queryFn: () => templateApi.fetchMyTemplates(profile!.id),
    enabled: !!profile?.id,
  });
}

export function useSaveAsTemplate() {
  const profile = useProfile();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { title: string; exerciseIds: string[] }) =>
      templateApi.saveAsTemplate(profile!.id, input.title, input.exerciseIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-templates", profile?.id] }),
  });
}

export function useDeleteTemplate() {
  const profile = useProfile();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (templateId: string) => templateApi.deleteTemplate(templateId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-templates", profile?.id] }),
  });
}
