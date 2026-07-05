import { View, StyleSheet, type ViewProps } from "react-native";

interface RowProps extends ViewProps {
  gap?: number;
  justify?: "start" | "between" | "center" | "end";
  align?: "start" | "center" | "end";
}

const justifyMap = {
  start: "flex-start" as const,
  between: "space-between" as const,
  center: "center" as const,
  end: "flex-end" as const,
};

const alignMap = {
  start: "flex-start" as const,
  center: "center" as const,
  end: "flex-end" as const,
};

export function Row({ gap = 0, justify = "start", align = "center", style, ...props }: RowProps) {
  return <View style={[{ flexDirection: "row", gap, justifyContent: justifyMap[justify], alignItems: alignMap[align] }, style]} {...props} />;
}

export function Spacer({ height = 16 }: { height?: number }) {
  return <View style={{ height }} />;
}
