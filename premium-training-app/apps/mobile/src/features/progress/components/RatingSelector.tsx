import { View, Pressable, StyleSheet } from "react-native";
import { Text } from "@shared/components/ui/Text";

interface RatingSelectorProps {
  label: string;
  value: number;
  onChange: (rating: number) => void;
}

export function RatingSelector({ label, value, onChange }: RatingSelectorProps) {
  return (
    <View style={{ gap: 8 }}>
      <Text variant="subhead" color="secondary">{label}</Text>
      <View style={styles.row}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable key={n} onPress={() => onChange(n)} style={[styles.circle, n <= value && styles.active]}>
            <Text variant="subhead" color={n <= value ? "primary" : "secondary"}>{n}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 8 },
  circle: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#2A2A2E" },
  active: { backgroundColor: "#0A84FF", borderColor: "#0A84FF" },
});
