import { Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Text } from "./Text";
import { colors } from "@shared/theme/tokens";

export function BackButton({ label = "Back" }: { label?: string }) {
  const navigation = useNavigation();
  return (
    <Pressable onPress={() => navigation.goBack()} style={styles.btn}>
      <Text variant="body" style={{ color: colors.primary }}>← {label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { paddingVertical: 8, marginBottom: 4 },
});
