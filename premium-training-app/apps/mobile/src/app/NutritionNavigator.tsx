import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NutritionHomeScreen } from "./screens/main/nutrition/NutritionHomeScreen";
import { AddMealScreen } from "./screens/main/nutrition/AddMealScreen";
import { SetTargetsScreen } from "./screens/main/nutrition/SetTargetsScreen";
import { colors } from "@shared/theme/tokens";

export type NutritionStackParamList = {
  NutritionHome: undefined;
  AddMeal: undefined;
  SetTargets: undefined;
};

const Stack = createNativeStackNavigator<NutritionStackParamList>();

const innerScreenOptions = {
  headerShown: true, headerBackTitle: "Back",
  headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.primary,
  headerTitleStyle: { color: colors.textPrimary }, headerShadowVisible: false, title: "",
};

export function NutritionNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="NutritionHome" component={NutritionHomeScreen} />
      <Stack.Screen name="AddMeal" component={AddMealScreen} options={innerScreenOptions} />
      <Stack.Screen name="SetTargets" component={SetTargetsScreen} options={innerScreenOptions} />
    </Stack.Navigator>
  );
}
