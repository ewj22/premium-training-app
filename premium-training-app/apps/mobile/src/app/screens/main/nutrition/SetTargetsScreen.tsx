import { useState } from "react";
import { View, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { NutritionStackParamList } from "../../../NutritionNavigator";
import { Screen, Text, Input, Button } from "@shared/components/ui";
import { useTargets, useSetSelfTargets } from "@features/nutrition/hooks/useNutrition";

type Props = NativeStackScreenProps<NutritionStackParamList, "SetTargets">;

export function SetTargetsScreen({ navigation }: Props) {
  const { data: current } = useTargets();
  const setTargets = useSetSelfTargets();
  const [cal, setCal] = useState(current?.calories?.toString() ?? "2000");
  const [pro, setPro] = useState(current?.proteinG?.toString() ?? "150");
  const [carb, setCarb] = useState(current?.carbsG?.toString() ?? "200");
  const [fat, setFat] = useState(current?.fatG?.toString() ?? "70");

  const handleSave = () => {
    setTargets.mutate({
      calories: parseInt(cal, 10) || 2000,
      proteinG: parseInt(pro, 10) || 150,
      carbsG: parseInt(carb, 10) || 200,
      fatG: parseInt(fat, 10) || 70,
    }, { onSuccess: () => navigation.goBack() });
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <Text variant="title1" style={{ marginTop: 16, marginBottom: 8 }}>Set Targets</Text>
          <Text variant="body" color="secondary" style={{ marginBottom: 24 }}>These are your daily macro targets. Your coach can also set these for you.</Text>
          <View style={{ gap: 16 }}>
            <Input label="Calories (kcal)" keyboardType="number-pad" value={cal} onChangeText={setCal} />
            <Input label="Protein (g)" keyboardType="number-pad" value={pro} onChangeText={setPro} />
            <Input label="Carbs (g)" keyboardType="number-pad" value={carb} onChangeText={setCarb} />
            <Input label="Fat (g)" keyboardType="number-pad" value={fat} onChangeText={setFat} />
            <Button label="Save Targets" fullWidth loading={setTargets.isPending} onPress={handleSave} />
            <Button label="Cancel" fullWidth variant="ghost" onPress={() => navigation.goBack()} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
