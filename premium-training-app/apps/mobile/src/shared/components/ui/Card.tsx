import { View, StyleSheet, type ViewProps } from "react-native";
import { colors, radius } from "@shared/theme/tokens";

interface CardProps extends ViewProps {
  className?: string;
  elevated?: boolean;
  padded?: boolean;
}

export function Card({ elevated = false, padded = true, style, children, ...props }: CardProps) {
  return (
    <View style={[styles.base, elevated ? styles.elevated : styles.card, padded && styles.padded, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.card, borderWidth: 1, borderColor: colors.borderSubtle },
  card: { backgroundColor: colors.backgroundCard },
  elevated: { backgroundColor: colors.backgroundElevated },
  padded: { padding: 16 },
});
