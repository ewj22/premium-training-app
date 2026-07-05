import { supabase } from "@shared/lib/supabase";
import type { AuthProfile, AppRole } from "@shared/lib/authStore";

export interface SignUpInput {
  email: string;
  password: string;
  fullName: string;
  role: AppRole; // 'client' unless invited as a coach
}

export async function signUpWithEmail({ email, password, fullName, role }: SignUpInput) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, role } },
  });
  if (error) throw error;
  return data;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function fetchProfile(userId: string): Promise<AuthProfile> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, full_name, avatar_url, onboarding_completed")
    .eq("id", userId)
    .single();

  if (error) throw error;

  return {
    id: data.id,
    role: data.role,
    fullName: data.full_name,
    avatarUrl: data.avatar_url,
    onboardingCompleted: data.onboarding_completed,
  };
}

/**
 * Called once immediately after signUpWithEmail succeeds — creates the
 * public.profiles row. (Could alternatively be done via a Postgres trigger
 * on auth.users; kept explicit here so the client controls onboarding state.)
 */
export async function createProfile(userId: string, fullName: string, role: AppRole) {
  const { error } = await supabase.from("profiles").insert({
    id: userId,
    full_name: fullName,
    role,
    onboarding_completed: false,
  });
  if (error) throw error;
}

export interface OnboardingInput {
  goal: string;
  weightKg: number | null;
  heightCm: number | null;
  dateOfBirth: string | null;
  sex: string | null;
  coachInviteCode: string | null;
}

/**
 * Completes onboarding: updates the profile with baseline info,
 * optionally logs initial weight to body_metrics, and flips the
 * onboarding_completed flag so the navigator routes to the main app.
 */
export async function completeOnboarding(userId: string, input: OnboardingInput) {
  // Update profile with baseline data
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      onboarding_completed: true,
      height_cm: input.heightCm,
      date_of_birth: input.dateOfBirth,
      sex: input.sex,
    })
    .eq("id", userId);

  if (profileError) throw profileError;

  // Log initial weight if provided
  if (input.weightKg) {
    await supabase.from("body_metrics").upsert(
      {
        client_id: userId,
        recorded_date: new Date().toISOString().slice(0, 10),
        weight_kg: input.weightKg,
      },
      { onConflict: "client_id,recorded_date" }
    );
  }

  // If a coach invite code was provided, look up the coach and create the relationship
  if (input.coachInviteCode) {
    const { data: coach } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", input.coachInviteCode)
      .eq("role", "coach")
      .single();

    if (coach) {
      await supabase.from("coach_clients").insert({
        coach_id: coach.id,
        client_id: userId,
        status: "accepted",
        accepted_at: new Date().toISOString(),
      });

      // Create a conversation so they can message immediately
      await supabase.from("conversations").insert({
        coach_id: coach.id,
        client_id: userId,
      });
    }
  }
}
