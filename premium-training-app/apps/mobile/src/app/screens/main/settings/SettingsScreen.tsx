import { ScrollView, View, Pressable, StyleSheet, Alert, Linking } from "react-native";
import { Screen, Text, Card, Avatar } from "@shared/components/ui";
import { useProfile } from "@shared/lib/authStore";
import { useSignOut } from "@features/auth/hooks/useAuth";
import { colors } from "@shared/theme/tokens";

interface SettingsRowProps {
  label: string;
  value?: string;
  icon?: string;
  onPress?: () => void;
  destructive?: boolean;
}

function SettingsRow({ label, value, icon, onPress, destructive }: SettingsRowProps) {
  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <View style={styles.row}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
          {icon && <Text variant="body">{icon}</Text>}
          <Text variant="body" color={destructive ? "danger" : "primary"}>{label}</Text>
        </View>
        {value && <Text variant="body" color="secondary">{value}</Text>}
        {onPress && !destructive && <Text variant="body" color="tertiary"> ›</Text>}
      </View>
    </Pressable>
  );
}

export function SettingsScreen({ navigation }: any) {
  const profile = useProfile();
  const signOut = useSignOut();

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => signOut.mutate() },
    ]);
  };

  const comingSoon = (feature: string) => {
    Alert.alert("Coming Soon", `${feature} will be available in a future update.`);
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text variant="largeTitle" style={{ marginTop: 8, marginBottom: 24 }}>⚙ Settings</Text>

        {/* Profile card */}
        <Card style={{ flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <Avatar fullName={profile?.fullName ?? "User"} uri={profile?.avatarUrl} size={56} />
          <View style={{ flex: 1 }}>
            <Text variant="title3">{profile?.fullName}</Text>
            <Text variant="footnote" color="secondary">{profile?.role === "coach" ? "Coach" : "Client"}</Text>
          </View>
        </Card>

        {/* Account section */}
        <Text variant="footnote" color="tertiary" style={styles.sectionHeader}>ACCOUNT</Text>
        <Card padded={false} style={{ marginBottom: 24 }}>
          <SettingsRow icon="👤" label="Edit Profile" onPress={() => navigation.navigate("EditProfile")} />
          <View style={styles.separator} />
          <SettingsRow icon="🔔" label="Notifications" onPress={() => comingSoon("Push notifications")} />
          <View style={styles.separator} />
          <SettingsRow icon="📏" label="Units" value="Metric (kg, cm)" onPress={() => comingSoon("Unit switching")} />
        </Card>

        {/* Training section */}
        <Text variant="footnote" color="tertiary" style={styles.sectionHeader}>TRAINING</Text>
        <Card padded={false} style={{ marginBottom: 24 }}>
          <SettingsRow icon="⏱" label="Default Rest Timer" value="90s" onPress={() => comingSoon("Custom rest timer")} />
          <View style={styles.separator} />
          <SettingsRow icon="🤝" label="Coach Connection" value="Not connected" onPress={() => comingSoon("Coach connection")} />
        </Card>

        {/* Data section */}
        <Text variant="footnote" color="tertiary" style={styles.sectionHeader}>DATA & PRIVACY</Text>
        <Card padded={false} style={{ marginBottom: 24 }}>
          <SettingsRow icon="📊" label="Export My Data" onPress={() => comingSoon("Data export")} />
          <View style={styles.separator} />
          <SettingsRow icon="🔒" label="Privacy Policy" onPress={() => comingSoon("Privacy policy")} />
          <View style={styles.separator} />
          <SettingsRow icon="📱" label="App Version" value="1.0.0" />
        </Card>

        {/* Sign out */}
        <Card padded={false}>
          <SettingsRow icon="🚪" label="Sign Out" destructive onPress={handleSignOut} />
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionHeader: { marginBottom: 8, paddingHorizontal: 4, letterSpacing: 0.5 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14 },
  separator: { height: 1, backgroundColor: colors.borderSubtle, marginLeft: 16 },
});
