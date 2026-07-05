import { View, StyleSheet } from "react-native";
import { Text } from "./Text";
import { Button } from "./Button";

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text variant="title3" style={{ textAlign: "center" }}>{title}</Text>
      {description && (
        <Text variant="subhead" color="secondary" style={{ textAlign: "center", marginBottom: 8 }}>{description}</Text>
      )}
      {actionLabel && onAction && (
        <Button label={actionLabel} onPress={onAction} size="sm" variant="secondary" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 8 },
});
