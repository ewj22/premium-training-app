import { useState } from "react";
import { ScrollView, View, Pressable } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { NutritionStackParamList } from "../../../NutritionNavigator";
import { Screen, Text, Card, Button, Input, LoadingSpinner } from "@shared/components/ui";
import { MacroBar } from "@features/nutrition/components/MacroBar";
import { HabitCard } from "@features/nutrition/components/HabitCard";
import { useTargets, useTodayMeals, useDeleteMeal, useTodayHabits, useUpsertHabit, useRecentWeights, useLogWeight } from "@features/nutrition/hooks/useNutrition";
import { colors } from "@shared/theme/tokens";

type Props = NativeStackScreenProps<NutritionStackParamList, "NutritionHome">;

export function NutritionHomeScreen({ navigation }: Props) {
  const { data: targets, isLoading: tl } = useTargets();
  const { data: meals, isLoading: ml } = useTodayMeals();
  const { data: habits } = useTodayHabits();
  const { data: weights } = useRecentWeights();
  const deleteMeal = useDeleteMeal();
  const upsertHabit = useUpsertHabit();
  const logWeightMut = useLogWeight();
  const [weightInput, setWeightInput] = useState("");

  const totals = (meals ?? []).reduce((a, m) => ({ calories: a.calories + m.calories, proteinG: a.proteinG + m.proteinG, carbsG: a.carbsG + m.carbsG, fatG: a.fatG + m.fatG }), { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 });
  const handleLogWeight = () => { const kg = parseFloat(weightInput); if (!isNaN(kg) && kg > 0) logWeightMut.mutate(kg, { onSuccess: () => setWeightInput("") }); };

  if (tl || ml) return <LoadingSpinner />;
  const t = targets ?? { calories: 2000, proteinG: 150, carbsG: 200, fatG: 70 };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text variant="largeTitle" style={{ marginTop: 16, marginBottom: 16 }}>Nutrition</Text>

        {/* Macro Dashboard */}
        <Card style={{ gap: 12, marginBottom: 16 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text variant="title3">Today's Macros</Text>
            <Button label="Set Targets" size="sm" variant="ghost" onPress={() => navigation.navigate("SetTargets")} />
          </View>
          <MacroBar label="Calories" current={totals.calories} target={t.calories} unit="kcal" color={colors.primary} />
          <MacroBar label="Protein" current={totals.proteinG} target={t.proteinG} unit="g" color={colors.accent} />
          <MacroBar label="Carbs" current={totals.carbsG} target={t.carbsG} unit="g" color={colors.warning} />
          <MacroBar label="Fat" current={totals.fatG} target={t.fatG} unit="g" color={colors.danger} />
        </Card>

        {/* Meals */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <Text variant="title3">Meals</Text>
          <Button label="Add Meal" size="sm" variant="secondary" onPress={() => navigation.navigate("AddMeal")} />
        </View>
        {(meals ?? []).length === 0 ? (
          <Card style={{ marginBottom: 16 }}><Text variant="subhead" color="secondary">No meals logged today.</Text></Card>
        ) : (
          <View style={{ gap: 8, marginBottom: 16 }}>
            {(meals ?? []).map((meal) => (
              <Card key={meal.id}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <View>
                    <Text variant="headline">{meal.mealName || "Meal"}</Text>
                    <Text variant="footnote" color="secondary">{meal.calories} kcal · {meal.proteinG}p · {meal.carbsG}c · {meal.fatG}f</Text>
                  </View>
                  <Pressable onPress={() => deleteMeal.mutate(meal.id)}><Text variant="footnote" color="danger">Delete</Text></Pressable>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Weight */}
        <Text variant="title3" style={{ marginBottom: 12 }}>Weight</Text>
        <Card style={{ gap: 12, marginBottom: 16 }}>
          {weights && weights.length > 0 && <Text variant="subhead" color="secondary">Latest: {weights[0].weightKg} kg ({weights[0].recordedDate})</Text>}
          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            <Input placeholder="kg" keyboardType="decimal-pad" value={weightInput} onChangeText={setWeightInput} style={{ flex: 1 }} />
            <Button label="Log" size="sm" loading={logWeightMut.isPending} onPress={handleLogWeight} />
          </View>
        </Card>

        {/* Habits - improved with custom inputs and flexible increments */}
        <Text variant="title3" style={{ marginBottom: 12 }}>Habits</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <HabitCard label="Steps" value={habits?.steps.value ?? 0} target={habits?.steps.target ?? 10000} unit="steps"
            quickIncrements={[500, 1000, 2500]}
            onUpdate={(v) => upsertHabit.mutate({ habitType: "steps", value: v, target: habits?.steps.target ?? 10000 })} />
          <HabitCard label="Water" value={habits?.water.value ?? 0} target={habits?.water.target ?? 2000} unit="ml"
            quickIncrements={[250, 500]}
            onUpdate={(v) => upsertHabit.mutate({ habitType: "water", value: v, target: habits?.water.target ?? 2000 })} />
          <HabitCard label="Sleep" value={habits?.sleep.value ?? 0} target={habits?.sleep.target ?? 8} unit="hrs"
            quickIncrements={[1, 0.5]}
            onUpdate={(v) => upsertHabit.mutate({ habitType: "sleep", value: v, target: habits?.sleep.target ?? 8 })} />
        </View>
      </ScrollView>
    </Screen>
  );
}
