import { ScrollView, View, StyleSheet } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { WorkoutsStackParamList } from "../../../WorkoutsNavigator";
import { Screen, Text, Card, Badge, LoadingSpinner } from "@shared/components/ui";
import { useExerciseDetail, usePreviousPerformance } from "@features/workouts";
import { useExerciseSubstitutions } from "@features/insights/hooks/useInsights";
import { colors } from "@shared/theme/tokens";

type Props = NativeStackScreenProps<WorkoutsStackParamList, "ExerciseDetail">;

export function ExerciseDetailScreen({ route }: Props) {
  const { exerciseId, exerciseName } = route.params;
  const { data: exercise, isLoading } = useExerciseDetail(exerciseId);
  const { data: previous } = usePreviousPerformance(exerciseId);
  const { data: subs } = useExerciseSubstitutions(exerciseId);

  if (isLoading) return <LoadingSpinner />;

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text variant="largeTitle" style={{ marginTop: 16, marginBottom: 4 }}>{exercise?.name ?? exerciseName}</Text>
        {exercise?.categoryName && <Badge label={exercise.categoryName} tone="primary" />}

        <Card style={{ gap: 12, marginTop: 16 }}>
          <Text variant="title3">Muscles</Text>
          <View style={styles.muscleRow}>
            <View style={styles.muscleTag}><Text variant="footnote" style={{ color: colors.primary }}>{exercise?.primaryMuscle}</Text></View>
            {exercise?.secondaryMuscles.map((m) => (
              <View key={m} style={styles.muscleTagSecondary}><Text variant="footnote" color="secondary">{m}</Text></View>
            ))}
          </View>
          {exercise?.equipment && <Text variant="subhead" color="secondary">Equipment: {exercise.equipment}</Text>}
        </Card>

        {previous?.bestWeightKg && (
          <Card style={{ gap: 8, marginTop: 12 }}>
            <Text variant="title3">Your Best</Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text variant="body" color="secondary">Heaviest lift</Text>
              <Text variant="headline">{previous.bestWeightKg}kg × {previous.bestReps}</Text>
            </View>
          </Card>
        )}

        {exercise?.instructions && (
          <Card style={{ gap: 8, marginTop: 12 }}>
            <Text variant="title3">Instructions</Text>
            <Text variant="body" color="secondary">{exercise.instructions}</Text>
          </Card>
        )}

        {/* Substitutions */}
        <Card style={{ gap: 10, marginTop: 12 }}>
          <Text variant="title3">Alternatives</Text>
          {(!subs || subs.length === 0) ? (
            <Text variant="subhead" color="tertiary">No substitutions set up yet. You can add these in the database.</Text>
          ) : (
            subs.map((sub) => (
              <View key={sub.id} style={styles.subRow}>
                <View>
                  <Text variant="headline">{sub.name}</Text>
                  <Text variant="caption" color="secondary">{sub.primaryMuscle}{sub.equipment ? ` · ${sub.equipment}` : ""}</Text>
                </View>
              </View>
            ))
          )}
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  muscleRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  muscleTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.primary + "1A" },
  muscleTagSecondary: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.backgroundElevated },
  subRow: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
});
