import { create } from "zustand";

interface ActiveWorkoutState {
  sessionId: string | null;
  startedAtMs: number | null;
  selectedExerciseIds: string[]; // used only during the exercise-picker step

  restSecondsRemaining: number | null; // null = timer not running
  restIntervalId: ReturnType<typeof setInterval> | null;

  startSession: (sessionId: string) => void;
  endSession: () => void;
  toggleExerciseSelection: (exerciseId: string) => void;
  clearExerciseSelection: () => void;

  startRestTimer: (seconds: number) => void;
  stopRestTimer: () => void;
  tickRestTimer: () => void;
}

/**
 * Deliberately narrow scope: only what the UI needs *live*, moment to
 * moment, during a workout (the timer ticking, which exercises are
 * checked in the picker). Actual sets are written straight to Supabase via
 * useSaveSet — so if the app crashes mid-workout, only the rest timer state
 * is lost, never logged data.
 */
export const useActiveWorkoutStore = create<ActiveWorkoutState>((set, get) => ({
  sessionId: null,
  startedAtMs: null,
  selectedExerciseIds: [],
  restSecondsRemaining: null,
  restIntervalId: null,

  startSession: (sessionId) => set({ sessionId, startedAtMs: Date.now() }),
  endSession: () => {
    get().stopRestTimer();
    set({ sessionId: null, startedAtMs: null });
  },

  toggleExerciseSelection: (exerciseId) =>
    set((state) => ({
      selectedExerciseIds: state.selectedExerciseIds.includes(exerciseId)
        ? state.selectedExerciseIds.filter((id) => id !== exerciseId)
        : [...state.selectedExerciseIds, exerciseId],
    })),
  clearExerciseSelection: () => set({ selectedExerciseIds: [] }),

  startRestTimer: (seconds) => {
    get().stopRestTimer();
    const intervalId = setInterval(() => get().tickRestTimer(), 1000);
    set({ restSecondsRemaining: seconds, restIntervalId: intervalId });
  },
  stopRestTimer: () => {
    const { restIntervalId } = get();
    if (restIntervalId) clearInterval(restIntervalId);
    set({ restSecondsRemaining: null, restIntervalId: null });
  },
  tickRestTimer: () => {
    const { restSecondsRemaining } = get();
    if (restSecondsRemaining === null) return;
    if (restSecondsRemaining <= 1) {
      get().stopRestTimer();
    } else {
      set({ restSecondsRemaining: restSecondsRemaining - 1 });
    }
  },
}));
