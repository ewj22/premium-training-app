import { useState } from "react";
import { View, TextInput, Pressable, StyleSheet, Modal } from "react-native";
import { Card } from "@shared/components/ui/Card";
import { Text } from "@shared/components/ui/Text";
import { Button } from "@shared/components/ui/Button";
import { colors } from "@shared/theme/tokens";

interface HabitCardProps {
  label: string;
  value: number;
  target: number | null;
  unit: string;
  quickIncrements: number[];
  onUpdate: (newValue: number) => void;
}

export function HabitCard({ label, value, target, unit, quickIncrements, onUpdate }: HabitCardProps) {
  const [showInput, setShowInput] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const pct = target && target > 0 ? Math.min((value / target) * 100, 100) : 0;

  const handleCustomSave = () => {
    const num = parseFloat(customValue);
    if (!isNaN(num) && num >= 0) {
      onUpdate(num);
      setShowInput(false);
      setCustomValue("");
    }
  };

  return (
    <Card style={styles.card}>
      <Text variant="footnote" color="secondary">{label}</Text>
      <Pressable onPress={() => { setCustomValue(value.toString()); setShowInput(true); }}>
        <Text variant="title2">{value}<Text variant="caption" color="tertiary"> {unit}</Text></Text>
      </Pressable>

      {target && target > 0 && (
        <View style={styles.track}>
          <View style={{ width: `${pct}%`, height: "100%", backgroundColor: colors.primary, borderRadius: 999 }} />
        </View>
      )}

      <View style={styles.btnRow}>
        {quickIncrements.map((inc) => (
          <Pressable key={inc} onPress={() => onUpdate(value + inc)} style={styles.incBtn}>
            <Text variant="caption" color="primary">+{inc}</Text>
          </Pressable>
        ))}
      </View>

      <Modal visible={showInput} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setShowInput(false)}>
          <View style={styles.modal}>
            <Text variant="headline" style={{ marginBottom: 12 }}>Set {label}</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="decimal-pad"
              value={customValue}
              onChangeText={setCustomValue}
              autoFocus
              placeholder={`Enter ${unit}`}
              placeholderTextColor={colors.textTertiary}
            />
            <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
              <Button label="Cancel" variant="secondary" size="sm" onPress={() => setShowInput(false)} style={{ flex: 1 }} />
              <Button label="Save" size="sm" onPress={handleCustomSave} style={{ flex: 1 }} />
            </View>
          </View>
        </Pressable>
      </Modal>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, gap: 6, minWidth: 0 },
  track: { height: 4, borderRadius: 999, backgroundColor: colors.backgroundElevated, overflow: "hidden" },
  btnRow: { flexDirection: "row", gap: 4 },
  incBtn: { flex: 1, paddingVertical: 4, borderRadius: 8, backgroundColor: colors.primary + "1A", alignItems: "center" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
  modal: { width: "80%", backgroundColor: colors.backgroundCard, borderRadius: 20, padding: 24 },
  modalInput: { height: 48, paddingHorizontal: 16, borderRadius: 10, backgroundColor: colors.backgroundElevated, borderWidth: 1, borderColor: colors.border, color: colors.textPrimary, fontSize: 17 },
});
