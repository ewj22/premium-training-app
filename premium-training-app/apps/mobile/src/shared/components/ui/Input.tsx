import { useState } from "react";
import { TextInput as RNTextInput, View, StyleSheet, type TextInputProps } from "react-native";
import { Text } from "./Text";
import { colors } from "@shared/theme/tokens";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  className?: string;
}

export function Input({ label, error, helperText, style, ...props }: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const borderColor = error ? colors.danger : isFocused ? colors.primary : colors.border;

  return (
    <View style={{ gap: 6 }}>
      {label && <Text variant="subhead" color="secondary">{label}</Text>}
      <RNTextInput
        style={[styles.input, { borderColor }, style]}
        placeholderTextColor={colors.textTertiary}
        onFocus={(e) => { setIsFocused(true); props.onFocus?.(e); }}
        onBlur={(e) => { setIsFocused(false); props.onBlur?.(e); }}
        {...props}
      />
      {(error || helperText) && <Text variant="footnote" color={error ? "danger" : "tertiary"}>{error ?? helperText}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  input: { height: 48, paddingHorizontal: 16, borderRadius: 10, backgroundColor: colors.backgroundElevated, borderWidth: 1, color: colors.textPrimary, fontSize: 17 },
});
