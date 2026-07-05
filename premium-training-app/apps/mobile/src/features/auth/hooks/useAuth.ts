import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@shared/lib/supabase";
import { useAuthStore } from "@shared/lib/authStore";
import { queryKeys } from "@shared/lib/queryClient";
import {
  signInWithEmail,
  signUpWithEmail,
  signOut as signOutApi,
  fetchProfile,
  createProfile,
  completeOnboarding,
  type SignUpInput,
  type OnboardingInput,
} from "../api/authApi";

/**
 * Mounted once at the app root (see App.tsx). Subscribes to Supabase auth
 * state changes and keeps the Zustand store in sync. Also fetches the
 * profile row whenever the session changes so `useProfile()` is always
 * accurate without every screen re-fetching it.
 */
export function useAuthListener() {
  const setSession = useAuthStore((s) => s.setSession);
  const setProfile = useAuthStore((s) => s.setProfile);
  const setInitializing = useAuthStore((s) => s.setInitializing);
  const qc = useQueryClient();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        try {
          const profile = await fetchProfile(session.user.id);
          setProfile(profile);
        } catch {
          // Profile row doesn't exist yet (e.g. mid-onboarding) — leave null,
          // the navigator will route to onboarding based on session presence.
        }
      }
      setInitializing(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        const profile = await fetchProfile(session.user.id).catch(() => null);
        setProfile(profile);
        qc.invalidateQueries({ queryKey: queryKeys.profile(session.user.id) });
      } else {
        setProfile(null);
      }
    });

    return () => subscription.subscription.unsubscribe();
  }, []);
}

export function useSignIn() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      signInWithEmail(email, password),
  });
}

export function useSignUp() {
  return useMutation({
    mutationFn: async (input: SignUpInput) => {
      const { user } = await signUpWithEmail(input);
      if (user) {
        await createProfile(user.id, input.fullName, input.role);
      }
      return user;
    },
  });
}

export function useSignOut() {
  const resetAuth = useAuthStore((s) => s.signOut);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: signOutApi,
    onSuccess: () => {
      resetAuth();
      qc.clear();
    },
  });
}

export function useCompleteOnboarding() {
  const session = useAuthStore((s) => s.session);
  const setProfile = useAuthStore((s) => s.setProfile);
  return useMutation({
    mutationFn: (input: OnboardingInput) =>
      completeOnboarding(session!.user.id, input),
    onSuccess: async () => {
      // Re-fetch the profile so the navigator sees onboardingCompleted = true
      // and routes to the main app immediately
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setProfile(profile);
      }
    },
  });
}
