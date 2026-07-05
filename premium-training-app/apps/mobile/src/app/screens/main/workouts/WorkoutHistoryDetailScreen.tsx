import { ScrollView, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { WorkoutsStackParamList } from "../../../WorkoutsNavigator";
import { Screen, Text, Card, Badge, LoadingSpinner } from "@shared/components/ui";
import { useSessionDetail } from "@features/workouts";

type Props = NativeStackScreenProps<WorkoutsStackParamList, "WorkoutHistoryDetail">;

export function WorkoutHistoryDetailScreen({ route }: Props) {
  const { sessionId } = route.params;
  const { data: exercises, isLoading } = useSessionDetail(sessionId);
  if (isLoading) return <LoadingSpinner />;

  return (
    <Screen>
      <Text variant="title1" style={{ marginTop: 16, marginBottom: 16 }}>Workout Summary</Text>
      <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 40 }}>
        {exercises?.map((ex) => (
          <Card key={ex.id}>
            <Text variant="headline" style={{ marginBottom: 8 }}>{ex.exerciseName}</Text>
            {ex.sets.filter((s) => s.completed).map((s) => (
              <View key={s.id} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4 }}>
                <Text variant="subhead" color="secondary">Set {s.setNumber}</Text>
                <Text variant="subhead">{s.weightKg ?? "-"}kg × {s.reps ?? "-"}</Text>
                {s.isPersonalBest && <Badge label="PB" tone="success" />}
              </View>
            ))}
          </Card>
        ))}
      </ScrollView>
    </Screen>
  );
}
