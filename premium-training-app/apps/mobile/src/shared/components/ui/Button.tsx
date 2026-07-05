import { Pressable, ActivityIndicator, StyleSheet, type PressableProps } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { Text } from "./Text";
import { colors, motion } from "@shared/theme/tokens";

type Variant = "primary" | "secondary" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends Omit<PressableProps, "children"> {
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

const variantBg: Record<Variant, string> = {
  primary: colors.primary,
  secondary: colors.backgroundElevated,
  ghost: "transparent",
  destructive: colors.danger,
};

const sizeHeight: Record<Size, number> = { sm: 36, md: 48, lg: 56 };
const sizePx: Record<Size, number> = { sm: 16, md: 24, lg: 32 };

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({ label, variant = "primary", size = "md", loading = false, fullWidth = false, disabled, icon, onPressIn, onPressOut, style, ...props }: ButtonProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const isDisabled = disabled || loading;

  return (
    <AnimatedPressable
      accessibilityRole="button" disabled={isDisabled}
      onPressIn={(e) => { scale.value = withSpring(motion.pressScale, motion.spring); onPressIn?.(e); }}
      onPressOut={(e) => { scale.value = withSpring(1, motion.spring); onPressOut?.(e); }}
      style={[animatedStyle, styles.base, { backgroundColor: variantBg[variant], height: sizeHeight[size], paddingHorizontal: sizePx[size], borderWidth: variant === "secondary" ? 1 : 0, borderColor: colors.border, opacity: isDisabled ? 0.5 : 1 }, fullWidth && styles.fullWidth, style]}
      {...props}
    >
      {loading ? <ActivityIndicator color="#fff" /> : <>{icon}<Text variant="headline">{label}</Text></>}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, borderRadius: 999 },
  fullWidth: { width: "100%" },
});
