import { create } from "zustand";
import type { Session } from "@supabase/supabase-js";

export type AppRole = "client" | "coach" | "admin";

export interface AuthProfile {
  id: string;
  role: AppRole;
  fullName: string;
  avatarUrl: string | null;
  onboardingCompleted: boolean;
}

interface AuthState {
  session: Session | null;
  profile: AuthProfile | null;
  isInitializing: boolean; // true until we've checked for an existing session
  setSession: (session: Session | null) => void;
  setProfile: (profile: AuthProfile | null) => void;
  setInitializing: (value: boolean) => void;
  signOut: () => void;
}

/**
 * Zustand is intentionally scoped to *client/session state* only — the
 * profile row, the current auth session, and derived role. Server data
 * (workouts, messages, etc.) always lives in React Query, never here.
 * This keeps a single mental model: Zustand = "who is using the app right
 * now", React Query = "what does the server currently say".
 */
export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  profile: null,
  isInitializing: true,
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  setInitializing: (value) => set({ isInitializing: value }),
  signOut: () => set({ session: null, profile: null }),
}));

// Convenience selectors — keeps components from re-rendering on unrelated
// slice changes and avoids repeating `useAuthStore((s) => s.x)` everywhere.
export const useSession = () => useAuthStore((s) => s.session);
export const useProfile = () => useAuthStore((s) => s.profile);
export const useIsCoach = () => useAuthStore((s) => s.profile?.role === "coach");
