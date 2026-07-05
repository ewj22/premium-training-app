import { supabase } from "@shared/lib/supabase";

export interface ConversationRow {
  id: string;
  coachId: string;
  coachName: string;
  lastMessageAt: string | null;
}

export interface MessageRow {
  id: string;
  senderRole: "client" | "coach";
  senderId: string;
  body: string | null;
  readAt: string | null;
  createdAt: string;
}

export async function fetchConversations(userId: string): Promise<ConversationRow[]> {
  const { data, error } = await supabase
    .from("conversations")
    .select("id, coach_id, client_id, last_message_at, profiles!conversations_coach_id_fkey(full_name)")
    .or(`coach_id.eq.${userId},client_id.eq.${userId}`)
    .order("last_message_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    coachId: row.coach_id,
    coachName: row.profiles?.full_name ?? "Coach",
    lastMessageAt: row.last_message_at,
  }));
}

export async function fetchMessages(conversationId: string): Promise<MessageRow[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("id, sender_role, sender_id, body, read_at, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    senderRole: row.sender_role as "client" | "coach",
    senderId: row.sender_id,
    body: row.body,
    readAt: row.read_at,
    createdAt: row.created_at,
  }));
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  senderRole: "client" | "coach",
  body: string
) {
  const { error: msgError } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: senderId,
    sender_role: senderRole,
    body,
  });
  if (msgError) throw msgError;

  await supabase
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", conversationId);
}

export async function markMessagesRead(conversationId: string, userId: string) {
  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .neq("sender_id", userId)
    .is("read_at", null);
}
