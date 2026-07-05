import { View, StyleSheet } from "react-native";
import { Text } from "@shared/components/ui/Text";

interface MacroBarProps {
  label: string;
  current: number;
  target: number;
  unit: string;
  color?: string;
}

export function MacroBar({ label, current, target, unit, color = "#0A84FF" }: MacroBarProps) {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  return (
    <View style={{ gap: 6 }}>
      <View style={styles.labelRow}>
        <Text variant="subhead">{label}</Text>
        <Text variant="subhead" color="secondary">{Math.round(current)} / {target} {unit}</Text>
      </View>
      <View style={styles.track}>
        <View style={{ width: `${pct}%`, height: "100%", backgroundColor: color, borderRadius: 999 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  labelRow: { flexDirection: "row", justifyContent: "space-between" },
  track: { height: 8, borderRadius: 999, backgroundColor: "#151517", overflow: "hidden" },
});
