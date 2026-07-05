import { FlatList, RefreshControl, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { WorkoutsStackParamList } from "../../../WorkoutsNavigator";
import { Screen, Text, Card, Button, Badge, EmptyState, LoadingSpinner } from "@shared/components/ui";
import { useWorkoutHistory } from "@features/workouts";
import type { WorkoutSessionRow } from "@features/workouts";
import { colors } from "@shared/theme/tokens";

type Props = NativeStackScreenProps<WorkoutsStackParamList, "WorkoutsHome">;
const statusTone: Record<WorkoutSessionRow["status"], "success" | "primary" | "neutral" | "warning"> = { completed: "success", scheduled: "primary", draft: "neutral", skipped: "warning" };

function formatDuration(seconds: number | null) {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  return `${m} min`;
}

export function WorkoutsHomeScreen({ navigation }: Props) {
  const { data: history, isLoading, refetch, isRefetching } = useWorkoutHistory();
  return (
    <Screen>
      <Text variant="largeTitle" style={{ marginTop: 16, marginBottom: 16 }}>🏋️ Workouts</Text>
      <Button label="💪 Start Workout" fullWidth size="lg" onPress={() => navigation.navigate("ExercisePicker")} />

      <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
        <Button label="📋 Templates" size="sm" variant="secondary" onPress={() => navigation.navigate("Templates")} style={{ flex: 1 }} />
        <Button label="🏆 Personal Bests" size="sm" variant="secondary" onPress={() => navigation.navigate("PersonalBests")} style={{ flex: 1 }} />
      </View>

      <Text variant="title3" style={{ marginTop: 24, marginBottom: 12 }}>📖 History</Text>
      {isLoading ? <LoadingSpinner /> : (
        <FlatList data={history} keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
          contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
          ListEmptyComponent={<EmptyState title="No workouts yet" description="Start your first workout above." />}
          renderItem={({ item }) => (
            <Card onTouchEnd={() => item.status === "completed" && navigation.navigate("WorkoutHistoryDetail", { sessionId: item.id })}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View style={{ flex: 1 }}>
                  <Text variant="headline">{item.title}</Text>
                  <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
                    <Text variant="footnote" color="secondary">📅 {item.scheduledDate ?? "No date"}</Text>
                    {item.durationSeconds && <Text variant="footnote" color="secondary">⏱ {formatDuration(item.durationSeconds)}</Text>}
                  </View>
                </View>
                <Badge label={item.status} tone={statusTone[item.status]} />
              </View>
            </Card>
          )}
        />
      )}
    </Screen>
  );
}
