import { useState } from "react";
import { View, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Screen, Text, Input, Button, Avatar } from "@shared/components/ui";
import { useProfile, useAuthStore } from "@shared/lib/authStore";
import { supabase } from "@shared/lib/supabase";
import { fetchProfile } from "@features/auth/api/authApi";

export function EditProfileScreen({ navigation }: any) {
  const profile = useProfile();
  const setProfile = useAuthStore((s) => s.setProfile);
  const [name, setName] = useState(profile?.fullName ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ full_name: name })
        .eq("id", profile!.id);
      if (updateError) throw updateError;

      const updated = await fetchProfile(profile!.id);
      setProfile(updated);
      navigation.goBack();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <Text variant="title1" style={{ marginTop: 16, marginBottom: 24 }}>Edit Profile</Text>

          <View style={{ alignItems: "center", marginBottom: 24 }}>
            <Avatar fullName={name || "User"} uri={profile?.avatarUrl} size={80} />
          </View>

          <View style={{ gap: 16 }}>
            <Input label="Full name" value={name} onChangeText={setName} placeholder="Your name" />
            {error && <Text variant="footnote" color="danger">{error}</Text>}
            <Button label="Save" fullWidth loading={saving} onPress={handleSave} />
            <Button label="Cancel" fullWidth variant="ghost" onPress={() => navigation.goBack()} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
