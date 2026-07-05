import { useState } from "react";
import { FlatList, Pressable, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { WorkoutsStackParamList } from "../../../WorkoutsNavigator";
import { Screen, Text, Card, Button, Input, LoadingSpinner } from "@shared/components/ui";
import { useExercises, useStartQuickWorkout } from "@features/workouts";

type Props = NativeStackScreenProps<WorkoutsStackParamList, "ExercisePicker">;

function generateWorkoutTitle(exerciseNames: string[]): string {
  if (exerciseNames.length === 0) return "Workout";
  // Find most common muscle groups from exercise names
  const muscles = new Set<string>();
  const keywords: Record<string, string> = {
    bench: "Push", press: "Push", fly: "Push", push: "Push", chest: "Chest",
    squat: "Legs", leg: "Legs", lunge: "Legs", calf: "Legs",
    deadlift: "Pull", row: "Pull", pull: "Pull", lat: "Back", back: "Back",
    curl: "Arms", tricep: "Arms",
    shoulder: "Shoulders", lateral: "Shoulders", overhead: "Shoulders", face: "Shoulders",
    plank: "Core", crunch: "Core", core: "Core",
    treadmill: "Cardio", rowing: "Cardio",
  };
  for (const name of exerciseNames) {
    for (const [key, group] of Object.entries(keywords)) {
      if (name.toLowerCase().includes(key)) { muscles.add(group); break; }
    }
  }
  const groups = Array.from(muscles);
  if (groups.length === 0) return "Workout";
  if (groups.length === 1) return `${groups[0]} Day`;
  if (groups.length === 2) return `${groups[0]} & ${groups[1]}`;
  return "Full Body";
}

export function ExercisePickerScreen({ navigation }: Props) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { data: exercises, isLoading } = useExercises(search);
  const startWorkout = useStartQuickWorkout();

  const toggle = (id: string) => setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const selectedNames = (exercises ?? []).filter((e) => selectedIds.includes(e.id)).map((e) => e.name);
  const workoutTitle = generateWorkoutTitle(selectedNames);

  const handleStart = () => {
    startWorkout.mutate({ title: workoutTitle, exerciseIds: selectedIds }, {
      onSuccess: ({ sessionId }) => navigation.replace("ActiveWorkout", { sessionId }),
    });
  };

  return (
    <Screen>
      <Text variant="title1" style={{ marginTop: 8, marginBottom: 12 }}>Choose Exercises</Text>
      <Input placeholder="Search exercises..." value={search} onChangeText={setSearch} style={{ marginBottom: 12 }} />
      {isLoading ? <LoadingSpinner /> : (
        <FlatList data={exercises} keyExtractor={(item) => item.id} contentContainerStyle={{ gap: 8, paddingBottom: 100 }}
          renderItem={({ item }) => {
            const selected = selectedIds.includes(item.id);
            return (
              <Card style={selected ? { borderColor: "#0A84FF", backgroundColor: "rgba(10,132,255,0.1)" } : undefined}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Pressable onPress={() => navigation.navigate("ExerciseDetail", { exerciseId: item.id, exerciseName: item.name })} style={{ flex: 1 }}>
                    <Text variant="headline">{item.name}</Text>
                    <Text variant="footnote" color="secondary">{item.primaryMuscle}{item.equipment ? ` · ${item.equipment}` : ""}</Text>
                  </Pressable>
                  <Pressable onPress={() => toggle(item.id)} style={{ paddingLeft: 16, paddingVertical: 8 }}>
                    <View style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: selected ? "#0A84FF" : "#2A2A2E", backgroundColor: selected ? "#0A84FF" : "transparent", alignItems: "center", justifyContent: "center" }}>
                      {selected && <Text style={{ color: "#fff", fontSize: 14 }}>✓</Text>}
                    </View>
                  </Pressable>
                </View>
              </Card>
            );
          }}
        />
      )}
      <View style={{ position: "absolute", bottom: 24, left: 16, right: 16 }}>
        <Button label={`Start ${workoutTitle} (${selectedIds.length})`} fullWidth size="lg" disabled={selectedIds.length === 0} loading={startWorkout.isPending} onPress={handleStart} />
      </View>
    </Screen>
  );
}
