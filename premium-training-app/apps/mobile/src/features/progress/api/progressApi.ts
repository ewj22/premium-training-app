import { supabase } from "@shared/lib/supabase";
import type { BodyMetricsEntry, CheckinForm, ProgressPhoto } from "../types";

const todayStr = () => new Date().toISOString().slice(0, 10);
const weekStart = () => {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay() + 1); // Monday
  return d.toISOString().slice(0, 10);
};

// ----------------------------------------------------------------------------
// Progress photos
// ----------------------------------------------------------------------------

export async function fetchProgressPhotos(clientId: string): Promise<ProgressPhoto[]> {
  const { data, error } = await supabase
    .from("progress_photos")
    .select("id, storage_path, angle, taken_date")
    .eq("client_id", clientId)
    .order("taken_date", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    storagePath: row.storage_path,
    angle: row.angle as ProgressPhoto["angle"],
    takenDate: row.taken_date,
  }));
}

export async function uploadProgressPhoto(
  clientId: string,
  fileUri: string,
  angle: ProgressPhoto["angle"]
): Promise<void> {
  const fileName = `${clientId}/${Date.now()}.jpg`;

  const response = await fetch(fileUri);
  const blob = await response.blob();

  const { error: uploadError } = await supabase.storage
    .from("progress-photos")
    .upload(fileName, blob, { contentType: "image/jpeg" });

  if (uploadError) throw uploadError;

  const { error: insertError } = await supabase.from("progress_photos").insert({
    client_id: clientId,
    storage_path: fileName,
    angle,
    taken_date: todayStr(),
  });

  if (insertError) throw insertError;
}

export function getPhotoUrl(storagePath: string): string {
  const { data } = supabase.storage.from("progress-photos").getPublicUrl(storagePath);
  return data.publicUrl;
}

// ----------------------------------------------------------------------------
// Body metrics
// ----------------------------------------------------------------------------

export async function fetchBodyMetrics(clientId: string): Promise<BodyMetricsEntry[]> {
  const { data, error } = await supabase
    .from("body_metrics")
    .select("id, recorded_date, weight_kg, body_fat_pct, waist_cm, chest_cm, hips_cm")
    .eq("client_id", clientId)
    .order("recorded_date", { ascending: false })
    .limit(20);

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    recordedDate: row.recorded_date,
    weightKg: row.weight_kg,
    bodyFatPct: row.body_fat_pct,
    waistCm: row.waist_cm,
    chestCm: row.chest_cm,
    hipsCm: row.hips_cm,
  }));
}

// ----------------------------------------------------------------------------
// Check-ins
// ----------------------------------------------------------------------------

export async function fetchRecentCheckins(clientId: string) {
  const { data, error } = await supabase
    .from("checkins")
    .select("id, week_start_date, status, weight_kg, adherence_pct, coach_feedback")
    .eq("client_id", clientId)
    .order("week_start_date", { ascending: false })
    .limit(10);

  if (error) throw error;
  return data ?? [];
}

export async function submitCheckin(clientId: string, coachId: string, form: CheckinForm) {
  const { error } = await supabase.from("checkins").upsert(
    {
      client_id: clientId,
      coach_id: coachId,
      week_start_date: weekStart(),
      status: "submitted",
      weight_kg: form.weightKg,
      energy_rating: form.energyRating,
      sleep_rating: form.sleepRating,
      stress_rating: form.stressRating,
      adherence_pct: form.adherencePct,
      client_notes: form.clientNotes,
      submitted_at: new Date().toISOString(),
    },
    { onConflict: "client_id,week_start_date" }
  );
  if (error) throw error;
}
