import { useState } from "react";
import { View, KeyboardAvoidingView, Platform, Pressable, StyleSheet } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../../AuthNavigator";
import { Screen, Text, Input, Button } from "@shared/components/ui";
import { useSignUp } from "@features/auth/hooks/useAuth";
import { colors } from "@shared/theme/tokens";
import type { AppRole } from "@shared/lib/authStore";

type Props = NativeStackScreenProps<AuthStackParamList, "SignUp">;

export function SignUpScreen({ navigation }: Props) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AppRole>("client");
  const [error, setError] = useState<string | null>(null);
  const signUp = useSignUp();

  const handleSubmit = () => {
    setError(null);
    signUp.mutate({ email, password, fullName, role }, { onError: (e) => setError(e instanceof Error ? e.message : "Sign up failed") });
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, justifyContent: "center", gap: 32 }}>
        <View style={{ gap: 4 }}>
          <Text variant="largeTitle">Create account</Text>
          <Text variant="body" color="secondary">Start your training journey</Text>
        </View>

        <View style={{ gap: 16 }}>
          {/* Role selector */}
          <View style={{ gap: 6 }}>
            <Text variant="subhead" color="secondary">I am a...</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Pressable onPress={() => setRole("client")} style={{ flex: 1 }}>
                <View style={[styles.roleCard, role === "client" && styles.roleActive]}>
                  <Text variant="title3">🏋️</Text>
                  <Text variant="headline" color={role === "client" ? "primary" : "secondary"}>Client</Text>
                </View>
              </Pressable>
              <Pressable onPress={() => setRole("coach")} style={{ flex: 1 }}>
                <View style={[styles.roleCard, role === "coach" && styles.roleActive]}>
                  <Text variant="title3">📋</Text>
                  <Text variant="headline" color={role === "coach" ? "primary" : "secondary"}>Coach</Text>
                </View>
              </Pressable>
            </View>
          </View>

          <Input label="Full name" value={fullName} onChangeText={setFullName} placeholder="Alex Johnson" />
          <Input label="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} placeholder="you@example.com" />
          <Input label="Password" secureTextEntry value={password} onChangeText={setPassword} placeholder="At least 8 characters" error={error ?? undefined} />
          <Button label="Create Account" fullWidth loading={signUp.isPending} disabled={!email || !password || !fullName} onPress={handleSubmit} />
        </View>

        <View style={{ flexDirection: "row", justifyContent: "center", gap: 6 }}>
          <Text variant="subhead" color="secondary">Already have an account?</Text>
          <Text variant="subhead" style={{ color: colors.primary }} onPress={() => navigation.navigate("SignIn")}>Sign in</Text>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  roleCard: { padding: 16, borderRadius: 16, backgroundColor: colors.backgroundCard, borderWidth: 1, borderColor: colors.borderSubtle, alignItems: "center", gap: 6 },
  roleActive: { borderColor: colors.primary, backgroundColor: colors.primary + "15" },
});
