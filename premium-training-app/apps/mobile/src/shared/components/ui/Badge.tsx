import { View, StyleSheet } from "react-native";
import { Text } from "./Text";
import { colors } from "@shared/theme/tokens";

type Tone = "neutral" | "success" | "warning" | "danger" | "primary";

const toneConfig: Record<Tone, { bg: string; textColor: "primary" | "accent" | "warning" | "danger" }> = {
  neutral: { bg: colors.backgroundElevated, textColor: "primary" },
  success: { bg: colors.accent + "26", textColor: "accent" },
  warning: { bg: colors.warning + "26", textColor: "warning" },
  danger: { bg: colors.danger + "26", textColor: "danger" },
  primary: { bg: colors.primary + "26", textColor: "primary" },
};

export function Badge({ label, tone = "neutral" }: { label: string; tone?: Tone }) {
  const { bg, textColor } = toneConfig[tone];
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text variant="caption" color={textColor} style={{ fontWeight: "600" }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, alignSelf: "flex-start" },
});
