import { QueryClient } from "@tanstack/react-query";

/**
 * Central QueryClient. Defaults tuned for a mobile app on variable networks:
 * - staleTime keeps data fresh-enough without refetching on every focus
 * - retry is conservative since Supabase RLS failures shouldn't be retried
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      gcTime: 1000 * 60 * 10,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

/**
 * Query key factory — centralizing keys prevents typos causing silent
 * cache misses and makes invalidation after mutations explicit and safe.
 */
export const queryKeys = {
  profile: (userId: string) => ["profile", userId] as const,
  coachClients: (coachId: string) => ["coach-clients", coachId] as const,
  workoutSessions: (clientId: string) => ["workout-sessions", clientId] as const,
  workoutSession: (sessionId: string) => ["workout-session", sessionId] as const,
  exercises: (filters?: Record<string, unknown>) => ["exercises", filters] as const,
  programmes: (coachId: string) => ["programmes", coachId] as const,
  nutritionLogs: (clientId: string, date: string) =>
    ["nutrition-logs", clientId, date] as const,
  bodyMetrics: (clientId: string) => ["body-metrics", clientId] as const,
  checkins: (userId: string) => ["checkins", userId] as const,
  conversations: (userId: string) => ["conversations", userId] as const,
  messages: (conversationId: string) => ["messages", conversationId] as const,
};
