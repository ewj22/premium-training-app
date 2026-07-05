import { useState } from "react";
import { View, KeyboardAvoidingView, Platform } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../../AuthNavigator";
import { Screen, Text, Input, Button } from "@shared/components/ui";
import { useSignIn } from "@features/auth/hooks/useAuth";

type Props = NativeStackScreenProps<AuthStackParamList, "SignIn">;

export function SignInScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const signIn = useSignIn();

  const handleSubmit = () => {
    setError(null);
    signIn.mutate({ email, password }, { onError: (e) => setError(e instanceof Error ? e.message : "Sign in failed") });
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, justifyContent: "center", gap: 32 }}>
        <View style={{ gap: 4 }}>
          <Text variant="largeTitle">Welcome back</Text>
          <Text variant="body" color="secondary">Sign in to continue your programme</Text>
        </View>
        <View style={{ gap: 16 }}>
          <Input label="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} placeholder="you@example.com" />
          <Input label="Password" secureTextEntry value={password} onChangeText={setPassword} placeholder="••••••••" error={error ?? undefined} />
          <Button label="Sign In" fullWidth loading={signIn.isPending} disabled={!email || !password} onPress={handleSubmit} />
        </View>
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 6 }}>
          <Text variant="subhead" color="secondary">Don't have an account?</Text>
          <Text variant="subhead" style={{ color: "#0A84FF" }} onPress={() => navigation.navigate("SignUp")}>Sign up</Text>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
