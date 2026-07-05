import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useProfile } from "@shared/lib/authStore";
import * as api from "../api/messagingApi";

export function useConversations() {
  const profile = useProfile();
  return useQuery({
    queryKey: ["conversations", profile?.id],
    queryFn: () => api.fetchConversations(profile!.id),
    enabled: !!profile?.id,
  });
}

export function useMessages(conversationId: string | undefined) {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => api.fetchMessages(conversationId!),
    enabled: !!conversationId,
    refetchInterval: 5000, // poll every 5s until we add Supabase Realtime
  });
}

export function useSendMessage() {
  const profile = useProfile();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, body }: { conversationId: string; body: string }) =>
      api.sendMessage(conversationId, profile!.id, profile!.role as "client" | "coach", body),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["messages", variables.conversationId] });
      qc.invalidateQueries({ queryKey: ["conversations", profile?.id] });
    },
  });
}

export function useMarkRead() {
  const profile = useProfile();
  return useMutation({
    mutationFn: (conversationId: string) => api.markMessagesRead(conversationId, profile!.id),
  });
}
