import { ScrollView, View, Pressable, Alert } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Screen, Text, Card, Button } from "@shared/components/ui";
import { useProfile } from "@shared/lib/authStore";
import { useSignOut } from "@features/auth/hooks/useAuth";
import { colors } from "@shared/theme/tokens";

export function CoachProfileScreen() {
  const profile = useProfile();
  const signOut = useSignOut();

  const copyInviteCode = async () => {
    if (profile?.id) {
      try {
        await Clipboard.setStringAsync(profile.id);
        Alert.alert("Copied!", "Your coach invite code has been copied to the clipboard. Share it with your clients.");
      } catch {
        Alert.alert("Your Coach ID", profile.id);
      }
    }
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text variant="largeTitle" style={{ marginTop: 16, marginBottom: 24 }}>👤 Coach Profile</Text>

        <Card style={{ gap: 12, marginBottom: 16 }}>
          <Text variant="title3">Your Invite Code</Text>
          <Text variant="body" color="secondary">Share this code with clients so they can connect to you during onboarding.</Text>
          <Pressable onPress={copyInviteCode}>
            <View style={{ backgroundColor: colors.backgroundElevated, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border }}>
              <Text variant="footnote" color="tertiary" style={{ marginBottom: 4 }}>Tap to copy</Text>
              <Text variant="subhead" style={{ color: colors.primary }}>{profile?.id}</Text>
            </View>
          </Pressable>
        </Card>

        <Card style={{ gap: 8, marginBottom: 16 }}>
          <Text variant="title3">{profile?.fullName}</Text>
          <Text variant="subhead" color="secondary">Role: Coach</Text>
        </Card>

        <Button label="🚪 Sign Out" variant="destructive" fullWidth onPress={() => {
          Alert.alert("Sign Out", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            { text: "Sign Out", style: "destructive", onPress: () => signOut.mutate() },
          ]);
        }} />
      </ScrollView>
    </Screen>
  );
}
