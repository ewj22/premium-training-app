import { SafeAreaView } from "react-native-safe-area-context";
import { View, StyleSheet, type ViewProps } from "react-native";
import { colors } from "@shared/theme/tokens";

export function Screen({ style, children, ...props }: ViewProps & { className?: string }) {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={[styles.inner, style]} {...props}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  inner: { flex: 1, paddingHorizontal: 16 },
});
