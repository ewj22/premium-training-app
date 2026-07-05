import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { WorkoutsHomeScreen } from "./screens/main/workouts/WorkoutsHomeScreen";
import { ExercisePickerScreen } from "./screens/main/workouts/ExercisePickerScreen";
import { ActiveWorkoutScreen } from "./screens/main/workouts/ActiveWorkoutScreen";
import { WorkoutHistoryDetailScreen } from "./screens/main/workouts/WorkoutHistoryDetailScreen";
import { PersonalBestsScreen } from "./screens/main/workouts/PersonalBestsScreen";
import { TemplatesScreen } from "./screens/main/workouts/TemplatesScreen";
import { ExerciseDetailScreen } from "./screens/main/workouts/ExerciseDetailScreen";
import { colors } from "@shared/theme/tokens";

export type WorkoutsStackParamList = {
  WorkoutsHome: undefined;
  ExercisePicker: undefined;
  ActiveWorkout: { sessionId: string };
  WorkoutHistoryDetail: { sessionId: string };
  PersonalBests: undefined;
  Templates: undefined;
  ExerciseDetail: { exerciseId: string; exerciseName: string };
};

const Stack = createNativeStackNavigator<WorkoutsStackParamList>();

const innerScreenOptions = {
  headerShown: true,
  headerBackTitle: "Back",
  headerStyle: { backgroundColor: colors.background },
  headerTintColor: colors.primary,
  headerTitleStyle: { color: colors.textPrimary },
  headerShadowVisible: false,
  title: "",
};

export function WorkoutsNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="WorkoutsHome" component={WorkoutsHomeScreen} />
      <Stack.Screen name="ExercisePicker" component={ExercisePickerScreen} options={innerScreenOptions} />
      <Stack.Screen name="ActiveWorkout" component={ActiveWorkoutScreen} options={{ ...innerScreenOptions, headerBackVisible: false }} />
      <Stack.Screen name="WorkoutHistoryDetail" component={WorkoutHistoryDetailScreen} options={innerScreenOptions} />
      <Stack.Screen name="PersonalBests" component={PersonalBestsScreen} options={innerScreenOptions} />
      <Stack.Screen name="Templates" component={TemplatesScreen} options={innerScreenOptions} />
      <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} options={innerScreenOptions} />
    </Stack.Navigator>
  );
}
