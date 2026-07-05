import { Text as RNText, type TextProps as RNTextProps } from "react-native";
import { colors, typography } from "@shared/theme/tokens";

type Variant = keyof typeof typography;
type Color = "primary" | "secondary" | "tertiary" | "accent" | "danger" | "warning";

const colorValues: Record<Color, string> = {
  primary: colors.textPrimary,
  secondary: colors.textSecondary,
  tertiary: colors.textTertiary,
  accent: colors.accent,
  danger: colors.danger,
  warning: colors.warning,
};

interface TextComponentProps extends RNTextProps {
  variant?: Variant;
  color?: Color;
  className?: string;
}

export function Text({ variant = "body", color = "primary", style, ...props }: TextComponentProps) {
  return <RNText style={[typography[variant], { color: colorValues[color] }, style]} {...props} />;
}
