import { useState, useEffect } from "react";
import { View, TextInput, Pressable, StyleSheet } from "react-native";
import { Text } from "@shared/components/ui/Text";
import { Badge } from "@shared/components/ui/Badge";
import type { LoggedSetRow } from "../types";

interface SetRowProps {
  setNumber: number;
  initial?: LoggedSetRow;
  onSave: (weightKg: number | null, reps: number | null) => void;
}

export function SetRow({ setNumber, initial, onSave }: SetRowProps) {
  const [weight, setWeight] = useState(initial?.weightKg?.toString() ?? "");
  const [reps, setReps] = useState(initial?.reps?.toString() ?? "");
  const [completed, setCompleted] = useState(initial?.completed ?? false);
  const [isPersonalBest, setIsPersonalBest] = useState(initial?.isPersonalBest ?? false);

  useEffect(() => {
    if (initial) {
      setWeight(initial.weightKg?.toString() ?? "");
      setReps(initial.reps?.toString() ?? "");
      setCompleted(initial.completed);
      setIsPersonalBest(initial.isPersonalBest);
    }
  }, [initial?.id]);

  const handleToggleComplete = () => {
    const next = !completed;
    setCompleted(next);
    if (next) onSave(weight ? parseFloat(weight) : null, reps ? parseInt(reps, 10) : null);
  };

  return (
    <View style={styles.row}>
      <View style={styles.setNum}><Text variant="footnote" color="tertiary">{setNumber}</Text></View>
      <TextInput style={styles.input} keyboardType="decimal-pad" placeholder="kg" placeholderTextColor="#636366" value={weight} onChangeText={setWeight} editable={!completed} />
      <TextInput style={styles.input} keyboardType="number-pad" placeholder="reps" placeholderTextColor="#636366" value={reps} onChangeText={setReps} editable={!completed} />
      {isPersonalBest && <Badge label="PB" tone="success" />}
      <Pressable onPress={handleToggleComplete} style={[styles.check, completed && styles.checkDone]}>
        {completed && <Text style={{ color: "#0A0A0B" }}>✓</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 },
  setNum: { width: 24, alignItems: "center" },
  input: { flex: 1, height: 40, paddingHorizontal: 12, borderRadius: 8, backgroundColor: "#151517", borderWidth: 1, borderColor: "#2A2A2E", color: "#FFFFFF", textAlign: "center" },
  check: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#2A2A2E" },
  checkDone: { backgroundColor: "#30D158", borderColor: "#30D158" },
});
