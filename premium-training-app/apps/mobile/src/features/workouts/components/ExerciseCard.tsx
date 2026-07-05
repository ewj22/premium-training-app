import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Card } from "@shared/components/ui/Card";
import { Text } from "@shared/components/ui/Text";
import { Button } from "@shared/components/ui/Button";
import { SetRow } from "./SetRow";
import { usePreviousPerformance, useSaveSet } from "../hooks/useWorkouts";
import { useProfile } from "@shared/lib/authStore";
import { colors } from "@shared/theme/tokens";
import type { LoggedExerciseRow } from "../types";

interface ExerciseCardProps {
  loggedExercise: LoggedExerciseRow;
  onSetLogged: () => void;
}

export function ExerciseCard({ loggedExercise, onSetLogged }: ExerciseCardProps) {
  const profile = useProfile();
  const { data: previous } = usePreviousPerformance(loggedExercise.exerciseId);
  const saveSet = useSaveSet();
  const [setCount, setSetCount] = useState(Math.max(loggedExercise.sets.length, 3));

  // Smart progression logic
  const lastSets = previous?.lastSets ?? [];
  const lastWeight = previous?.bestWeightKg;
  const lastReps = lastSets.map((s) => s.reps ?? 0);
  const allHitTop = lastReps.length > 0 && lastReps.every((r) => r >= 12);
  const suggestion = lastWeight
    ? allHitTop
      ? { weight: lastWeight + 2.5, text: `⬆ Try ${lastWeight + 2.5}kg (hit top of range last time)` }
      : { weight: lastWeight, text: `➡ Stay at ${lastWeight}kg (build reps)` }
    : null;

  const handleSave = (setNumber: number) => (weightKg: number | null, reps: number | null) => {
    saveSet.mutate({
      loggedExerciseId: loggedExercise.id, exerciseId: loggedExercise.exerciseId,
      clientId: profile!.id, setNumber, setType: "normal", weightKg, reps, rpe: null,
    }, { onSuccess: onSetLogged });
  };

  return (
    <Card style={{ gap: 12 }}>
      <View>
        <Text variant="headline">{loggedExercise.exerciseName}</Text>
        {previous?.bestWeightKg ? (
          <Text variant="footnote" color="secondary">Last: {previous.bestWeightKg}kg × {previous.bestReps}</Text>
        ) : (
          <Text variant="footnote" color="tertiary">First time — set the benchmark</Text>
        )}
        {suggestion && (
          <View style={styles.suggestion}>
            <Text variant="caption" style={{ color: colors.primary }}>{suggestion.text}</Text>
          </View>
        )}
      </View>
      <View>
        <View style={styles.headerRow}>
          <Text variant="caption" color="tertiary" style={styles.headerLabel}>WEIGHT</Text>
          <Text variant="caption" color="tertiary" style={styles.headerLabel}>REPS</Text>
        </View>
        {Array.from({ length: setCount }).map((_, i) => (
          <SetRow key={i} setNumber={i + 1} initial={loggedExercise.sets[i]} onSave={handleSave(i + 1)} />
        ))}
      </View>
      <Button label="Add Set" size="sm" variant="ghost" onPress={() => setSetCount((c) => c + 1)} />
    </Card>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: "row", gap: 12, paddingLeft: 36, marginBottom: 4 },
  headerLabel: { flex: 1, textAlign: "center" },
  suggestion: { marginTop: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: colors.primary + "15", alignSelf: "flex-start" },
});
