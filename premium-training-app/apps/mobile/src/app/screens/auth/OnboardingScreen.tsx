import { useState } from "react";
import { View, ScrollView, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { Screen, Text, Input, Button } from "@shared/components/ui";
import { useSignOut, useCompleteOnboarding } from "@features/auth/hooks/useAuth";

type Step = "goal" | "body" | "coach";

const GOALS = [
  { id: "build_muscle", label: "Build Muscle", emoji: "💪" },
  { id: "lose_fat", label: "Lose Fat", emoji: "🔥" },
  { id: "get_stronger", label: "Get Stronger", emoji: "🏋️" },
  { id: "general_fitness", label: "General Fitness", emoji: "🏃" },
  { id: "sport_performance", label: "Sport Performance", emoji: "⚡" },
];

const SEX_OPTIONS = [
  { id: "male", label: "Male" },
  { id: "female", label: "Female" },
  { id: "other", label: "Other" },
  { id: "prefer_not_to_say", label: "Prefer not to say" },
];

export function OnboardingScreen() {
  const [step, setStep] = useState<Step>("goal");
  const [goal, setGoal] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [dob, setDob] = useState("");
  const [sex, setSex] = useState("");
  const [coachCode, setCoachCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const signOut = useSignOut();
  const complete = useCompleteOnboarding();

  const handleFinish = () => {
    setError(null);
    complete.mutate(
      {
        goal,
        weightKg: weight ? parseFloat(weight) : null,
        heightCm: height ? parseFloat(height) : null,
        dateOfBirth: dob || null,
        sex: sex || null,
        coachInviteCode: coachCode.trim() || null,
      },
      { onError: (e) => setError(e instanceof Error ? e.message : "Something went wrong") }
    );
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Progress dots */}
          <View style={styles.dotsRow}>
            {(["goal", "body", "coach"] as Step[]).map((s) => (
              <View key={s} style={[styles.dot, step === s && styles.dotActive]} />
            ))}
          </View>

          {step === "goal" && (
            <View style={{ gap: 24 }}>
              <View style={{ gap: 4 }}>
                <Text variant="largeTitle">What's your goal?</Text>
                <Text variant="body" color="secondary">This helps us tailor your experience</Text>
              </View>
              <View style={{ gap: 10 }}>
                {GOALS.map((g) => (
                  <Pressable key={g.id} onPress={() => setGoal(g.id)}>
                    <View style={[styles.optionCard, goal === g.id && styles.optionSelected]}>
                      <Text variant="title3">{g.emoji}</Text>
                      <Text variant="headline">{g.label}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
              <Button label="Continue" fullWidth disabled={!goal} onPress={() => setStep("body")} />
            </View>
          )}

          {step === "body" && (
            <View style={{ gap: 24 }}>
              <View style={{ gap: 4 }}>
                <Text variant="largeTitle">About you</Text>
                <Text variant="body" color="secondary">All fields are optional — fill in what you're comfortable with</Text>
              </View>
              <View style={{ gap: 16 }}>
                <Input label="Current weight (kg)" placeholder="e.g. 75" keyboardType="decimal-pad" value={weight} onChangeText={setWeight} />
                <Input label="Height (cm)" placeholder="e.g. 178" keyboardType="decimal-pad" value={height} onChangeText={setHeight} />
                <Input label="Date of birth" placeholder="YYYY-MM-DD" value={dob} onChangeText={setDob} />
                <View style={{ gap: 6 }}>
                  <Text variant="subhead" color="secondary">Sex</Text>
                  <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                    {SEX_OPTIONS.map((opt) => (
                      <Pressable key={opt.id} onPress={() => setSex(opt.id)}>
                        <View style={[styles.pillOption, sex === opt.id && styles.pillSelected]}>
                          <Text variant="footnote" color={sex === opt.id ? "primary" : "secondary"}>{opt.label}</Text>
                        </View>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </View>
              <View style={{ flexDirection: "row", gap: 12 }}>
                <Button label="Back" variant="secondary" onPress={() => setStep("goal")} style={{ flex: 1 }} />
                <Button label="Continue" onPress={() => setStep("coach")} style={{ flex: 1 }} />
              </View>
            </View>
          )}

          {step === "coach" && (
            <View style={{ gap: 24 }}>
              <View style={{ gap: 4 }}>
                <Text variant="largeTitle">Got a coach?</Text>
                <Text variant="body" color="secondary">If your coach gave you an invite code, enter it below. You can also skip this and add a coach later.</Text>
              </View>
              <Input label="Coach invite code (optional)" placeholder="Paste code here" value={coachCode} onChangeText={setCoachCode} />
              {error && <Text variant="footnote" color="danger">{error}</Text>}
              <Button label="Let's Go" fullWidth size="lg" loading={complete.isPending} onPress={handleFinish} />
              <View style={{ flexDirection: "row", gap: 12 }}>
                <Button label="Back" variant="secondary" onPress={() => setStep("body")} style={{ flex: 1 }} />
                <Button label="Sign Out" variant="ghost" onPress={() => signOut.mutate()} style={{ flex: 1 }} />
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  dotsRow: { flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 16, marginBottom: 32 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#2A2A2E" },
  dotActive: { backgroundColor: "#0A84FF", width: 24 },
  optionCard: {
    flexDirection: "row", alignItems: "center", gap: 16,
    padding: 16, borderRadius: 16,
    backgroundColor: "#1C1C1F", borderWidth: 1, borderColor: "#1F1F22",
  },
  optionSelected: { borderColor: "#0A84FF", backgroundColor: "rgba(10,132,255,0.1)" },
  pillOption: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
    backgroundColor: "#1C1C1F", borderWidth: 1, borderColor: "#2A2A2E",
  },
  pillSelected: { borderColor: "#0A84FF", backgroundColor: "rgba(10,132,255,0.15)" },
});
