import { useState } from "react";
import { View, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { NutritionStackParamList } from "../../../NutritionNavigator";
import { Screen, Text, Input, Button } from "@shared/components/ui";
import { useAddMeal } from "@features/nutrition/hooks/useNutrition";

type Props = NativeStackScreenProps<NutritionStackParamList, "AddMeal">;

export function AddMealScreen({ navigation }: Props) {
  const [mealName, setMealName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const addMeal = useAddMeal();

  const handleSave = () => {
    addMeal.mutate({ mealName: mealName || "Meal", calories: parseInt(calories, 10) || 0, proteinG: parseFloat(protein) || 0, carbsG: parseFloat(carbs) || 0, fatG: parseFloat(fat) || 0 }, { onSuccess: () => navigation.goBack() });
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <Text variant="title1" style={{ marginTop: 16, marginBottom: 16 }}>Add Meal</Text>
          <View style={{ gap: 16 }}>
            <Input label="Meal name" placeholder="e.g. Chicken & Rice" value={mealName} onChangeText={setMealName} />
            <Input label="Calories" placeholder="0" keyboardType="number-pad" value={calories} onChangeText={setCalories} />
            <Input label="Protein (g)" placeholder="0" keyboardType="decimal-pad" value={protein} onChangeText={setProtein} />
            <Input label="Carbs (g)" placeholder="0" keyboardType="decimal-pad" value={carbs} onChangeText={setCarbs} />
            <Input label="Fat (g)" placeholder="0" keyboardType="decimal-pad" value={fat} onChangeText={setFat} />
            <Button label="Save Meal" fullWidth loading={addMeal.isPending} onPress={handleSave} />
            <Button label="Cancel" fullWidth variant="ghost" onPress={() => navigation.goBack()} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
