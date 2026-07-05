import { ScrollView, View, StyleSheet } from "react-native";
import { Screen, Text, Card, LoadingSpinner } from "@shared/components/ui";
import { useWeeklyReview } from "@features/insights/hooks/useInsights";
import { colors } from "@shared/theme/tokens";

export function WeeklyReviewScreen() {
  const { data: review, isLoading } = useWeeklyReview();
  if (isLoading) return <LoadingSpinner />;
  if (!review) return null;

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text variant="largeTitle" style={{ marginTop: 16, marginBottom: 16 }}>Weekly Review</Text>

        {/* Compliance */}
        <Card style={{ alignItems: "center", gap: 8, marginBottom: 16 }}>
          <Text variant="caption" color="secondary">COMPLIANCE SCORE</Text>
          <Text variant="largeTitle" style={{ color: review.complianceScore >= 80 ? colors.accent : review.complianceScore >= 50 ? colors.warning : colors.danger }}>
            {review.complianceScore}%
          </Text>
        </Card>

        {/* Stats grid */}
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
          <Card style={{ flex: 1, alignItems: "center", gap: 4 }}>
            <Text variant="title2">{review.workoutsCompleted}</Text>
            <Text variant="caption" color="secondary">Workouts</Text>
          </Card>
          <Card style={{ flex: 1, alignItems: "center", gap: 4 }}>
            <Text variant="title2">{review.newPBs}</Text>
            <Text variant="caption" color="secondary">New PBs</Text>
          </Card>
        </View>

        <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
          <Card style={{ flex: 1, alignItems: "center", gap: 4 }}>
            <Text variant="title2">{review.caloriesAvg}</Text>
            <Text variant="caption" color="secondary">Avg Calories</Text>
          </Card>
          <Card style={{ flex: 1, alignItems: "center", gap: 4 }}>
            <Text variant="title2">{review.proteinAvg}g</Text>
            <Text variant="caption" color="secondary">Avg Protein</Text>
          </Card>
        </View>

        {/* Weight change */}
        {review.weightChange !== null && (
          <Card style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text variant="body">Weight Change</Text>
              <Text variant="headline" style={{ color: review.weightChange > 0 ? colors.warning : colors.accent }}>
                {review.weightChange > 0 ? "+" : ""}{review.weightChange.toFixed(1)}kg
              </Text>
            </View>
          </Card>
        )}

        {/* Best lift */}
        {review.bestLift && (
          <Card style={{ gap: 4 }}>
            <Text variant="footnote" color="secondary">BEST LIFT THIS WEEK</Text>
            <Text variant="title3">🏆 {review.bestLift.exercise}</Text>
            <Text variant="headline" style={{ color: colors.warning }}>
              {review.bestLift.weight}kg × {review.bestLift.reps}
            </Text>
          </Card>
        )}
      </ScrollView>
    </Screen>
  );
}
