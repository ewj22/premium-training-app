import { View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Text } from "./Text";
import { colors } from "@shared/theme/tokens";

interface AvatarProps { uri?: string | null; fullName: string; size?: number; }

function getInitials(n: string) { return n.trim().split(/\s+/).slice(0,2).map(p => p[0]?.toUpperCase() ?? "").join("") || "?"; }

export function Avatar({ uri, fullName, size = 40 }: AvatarProps) {
  if (uri) return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} transition={150} />;
  return (
    <View style={[styles.fallback, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text variant="subhead" style={{ fontSize: size * 0.38, color: colors.primary }}>{getInitials(fullName)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { backgroundColor: colors.primary + "33", alignItems: "center", justifyContent: "center" },
});
