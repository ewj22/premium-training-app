import { View, StyleSheet } from "react-native";
import { Text } from "@shared/components/ui/Text";
import { Button } from "@shared/components/ui/Button";
import { useActiveWorkoutStore } from "../store/activeWorkoutStore";

const PRESETS = [60, 90, 120];

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function RestTimer() {
  const restSecondsRemaining = useActiveWorkoutStore((s) => s.restSecondsRemaining);
  const startRestTimer = useActiveWorkoutStore((s) => s.startRestTimer);
  const stopRestTimer = useActiveWorkoutStore((s) => s.stopRestTimer);

  if (restSecondsRemaining === null) {
    return (
      <View style={styles.presetsRow}>
        <Text variant="footnote" color="tertiary">Rest:</Text>
        {PRESETS.map((seconds) => (
          <Button key={seconds} label={`${seconds}s`} size="sm" variant="secondary" onPress={() => startRestTimer(seconds)} />
        ))}
      </View>
    );
  }

  return (
    <View style={styles.activeRow}>
      <Text variant="title2" style={{ color: "#0A84FF" }}>{formatTime(restSecondsRemaining)}</Text>
      <Button label="Skip" size="sm" variant="ghost" onPress={stopRestTimer} />
    </View>
  );
}

const styles = StyleSheet.create({
  presetsRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  activeRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "rgba(10,132,255,0.15)", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12 },
});
