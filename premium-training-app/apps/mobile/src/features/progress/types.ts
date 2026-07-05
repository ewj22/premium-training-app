export interface ProgressPhoto {
  id: string;
  storagePath: string;
  angle: "front" | "side" | "back" | null;
  takenDate: string;
}

export interface BodyMetricsEntry {
  id: string;
  recordedDate: string;
  weightKg: number | null;
  bodyFatPct: number | null;
  waistCm: number | null;
  chestCm: number | null;
  hipsCm: number | null;
}

export interface CheckinForm {
  weightKg: number | null;
  energyRating: number;
  sleepRating: number;
  stressRating: number;
  adherencePct: number;
  clientNotes: string;
}
