import { useState } from "react";
import { ScrollView, View, KeyboardAvoidingView, Platform } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ProgressStackParamList } from "../../../ProgressNavigator";
import { Screen, Text, Input, Button } from "@shared/components/ui";
import { RatingSelector } from "@features/progress/components/RatingSelector";
import { useSubmitCheckin } from "@features/progress/hooks/useProgress";

type Props = NativeStackScreenProps<ProgressStackParamList, "SubmitCheckin">;

export function SubmitCheckinScreen({ navigation }: Props) {
  const [weight, setWeight] = useState("");
  const [energy, setEnergy] = useState(3);
  const [sleep, setSleep] = useState(3);
  const [stress, setStress] = useState(3);
  const [hunger, setHunger] = useState(3);
  const [recovery, setRecovery] = useState(3);
  const [motivation, setMotivation] = useState(3);
  const [soreness, setSoreness] = useState(3);
  const [digestion, setDigestion] = useState(3);
  const [adherence, setAdherence] = useState("");
  const [biggestWin, setBiggestWin] = useState("");
  const [biggestStruggle, setBiggestStruggle] = useState("");
  const [notes, setNotes] = useState("");
  const submit = useSubmitCheckin();

  const handleSubmit = () => {
    submit.mutate({
      coachId: "",
      form: {
        weightKg: weight ? parseFloat(weight) : null,
        energyRating: energy,
        sleepRating: sleep,
        stressRating: stress,
        adherencePct: adherence ? parseInt(adherence, 10) : 80,
        clientNotes: [
          biggestWin ? `Win: ${biggestWin}` : "",
          biggestStruggle ? `Struggle: ${biggestStruggle}` : "",
          notes,
        ].filter(Boolean).join("\n"),
      },
    }, { onSuccess: () => navigation.goBack() });
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <Text variant="title1" style={{ marginTop: 16, marginBottom: 16 }}>Weekly Check-in</Text>
          <View style={{ gap: 16 }}>
            <Input label="Current weight (kg)" placeholder="e.g. 82.5" keyboardType="decimal-pad" value={weight} onChangeText={setWeight} />

            <Text variant="title3" style={{ marginTop: 8 }}>How are you feeling?</Text>
            <RatingSelector label="Energy" value={energy} onChange={setEnergy} />
            <RatingSelector label="Sleep quality" value={sleep} onChange={setSleep} />
            <RatingSelector label="Stress (1=low, 5=high)" value={stress} onChange={setStress} />
            <RatingSelector label="Hunger (1=low, 5=high)" value={hunger} onChange={setHunger} />
            <RatingSelector label="Recovery" value={recovery} onChange={setRecovery} />
            <RatingSelector label="Motivation" value={motivation} onChange={setMotivation} />
            <RatingSelector label="Soreness (1=none, 5=severe)" value={soreness} onChange={setSoreness} />
            <RatingSelector label="Digestion" value={digestion} onChange={setDigestion} />

            <Text variant="title3" style={{ marginTop: 8 }}>Reflect</Text>
            <Input label="Plan adherence (%)" placeholder="e.g. 85" keyboardType="number-pad" value={adherence} onChangeText={setAdherence} />
            <Input label="Biggest win this week" placeholder="e.g. Hit a new PB on bench" value={biggestWin} onChangeText={setBiggestWin} />
            <Input label="Biggest struggle" placeholder="e.g. Missed meals on Thursday" value={biggestStruggle} onChangeText={setBiggestStruggle} />
            <Input label="Additional notes" placeholder="Anything else for your coach?" multiline numberOfLines={3} value={notes} onChangeText={setNotes} style={{ height: 80 }} />

            <Button label="Submit Check-in" fullWidth loading={submit.isPending} onPress={handleSubmit} />
            <Button label="Cancel" fullWidth variant="ghost" onPress={() => navigation.goBack()} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
