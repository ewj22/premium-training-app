import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Text } from "./Text";
import { colors } from "@shared/theme/tokens";

export function LoadingSpinner({ message }: { message?: string }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      {message && <Text variant="subhead" color="secondary" style={{ marginTop: 12 }}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
});
