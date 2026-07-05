import { ScrollView, View, Pressable, StyleSheet } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { DashboardStackParamList } from "../../DashboardNavigator";
import { Screen, Text, Card, Badge } from "@shared/components/ui";
import { useProfile } from "@shared/lib/authStore";
import { useWorkoutHistory } from "@features/workouts";
import { useTodayMeals, useTargets, useTodayHabits } from "@features/nutrition/hooks/useNutrition";
import { MacroBar } from "@features/nutrition/components/MacroBar";
import { useCompliance, useStreaks, useWeeklyReview } from "@features/insights/hooks/useInsights";
import { colors } from "@shared/theme/tokens";

type Props = NativeStackScreenProps<DashboardStackParamList, "DashboardHome">;

export function DashboardScreen({ navigation }: Props) {
  const profile = useProfile();
  const { data: habits } = useTodayHabits();
  const { data: targets } = useTargets();
  const { data: meals } = useTodayMeals();
  const { data: compliance } = useCompliance();
  const { data: streaks } = useStreaks();
  const { data: review } = useWeeklyReview();

  const totals = (meals ?? []).reduce((a, m) => ({ calories: a.calories + m.calories, proteinG: a.proteinG + m.proteinG, carbsG: a.carbsG + m.carbsG, fatG: a.fatG + m.fatG }), { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 });
  const t = targets ?? { calories: 2000, proteinG: 150, carbsG: 200, fatG: 70 };

  const workoutStreak = streaks?.find((s) => s.streakType === "workout")?.currentCount ?? 0;
  const bestStreak = streaks?.find((s) => s.streakType === "workout")?.longestCount ?? 0;

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.header}>
          <Text variant="largeTitle">Hi {profile?.fullName?.split(" ")[0] ?? "there"}</Text>
          <Pressable onPress={() => navigation.navigate("Settings")} style={styles.settingsBtn}>
            <Text variant="title3" style={{ color: colors.textSecondary }}>⚙</Text>
          </Pressable>
        </View>

        {/* Compliance Score */}
        <Pressable onPress={() => navigation.navigate("WeeklyReview" as any)}>
          <Card style={{ alignItems: "center", gap: 6, marginBottom: 16 }}>
            <Text variant="caption" color="secondary">WEEKLY COMPLIANCE</Text>
            <Text variant="largeTitle" style={{ color: (compliance?.overall ?? 0) >= 80 ? colors.accent : (compliance?.overall ?? 0) >= 50 ? colors.warning : colors.danger }}>
              {compliance?.overall ?? 0}%
            </Text>
            {compliance?.summary && <Text variant="footnote" color="secondary" style={{ textAlign: "center" }}>{compliance.summary}</Text>}
          </Card>
        </Pressable>

        {/* Streaks */}
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
          <Card style={{ flex: 1, alignItems: "center", gap: 2 }}>
            <Text variant="title2">🔥 {workoutStreak}</Text>
            <Text variant="caption" color="secondary">Day Streak</Text>
          </Card>
          <Card style={{ flex: 1, alignItems: "center", gap: 2 }}>
            <Text variant="title2">⭐ {bestStreak}</Text>
            <Text variant="caption" color="secondary">Best Streak</Text>
          </Card>
          <Pressable onPress={() => navigation.navigate("Achievements" as any)} style={{ flex: 1 }}>
            <Card style={{ flex: 1, alignItems: "center", gap: 2 }}>
              <Text variant="title2">🏆</Text>
              <Text variant="caption" color="primary">Badges</Text>
            </Card>
          </Pressable>
        </View>

        {/* Quick links */}
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
          <Pressable onPress={() => navigation.navigate("CoachInsights" as any)} style={{ flex: 1 }}>
            <Card style={{ alignItems: "center", gap: 4 }}>
              <Text variant="title3">📈</Text>
              <Text variant="caption" color="primary">Insights</Text>
            </Card>
          </Pressable>
          <Pressable onPress={() => navigation.navigate("WeeklyReview" as any)} style={{ flex: 1 }}>
            <Card style={{ alignItems: "center", gap: 4 }}>
              <Text variant="title3">📋</Text>
              <Text variant="caption" color="primary">Week Review</Text>
            </Card>
          </Pressable>
        </View>

        {/* Today's macros */}
        <Card style={{ gap: 12, marginBottom: 16 }}>
          <Text variant="title3">Today's Nutrition</Text>
          <MacroBar label="Calories" current={totals.calories} target={t.calories} unit="kcal" color={colors.primary} />
          <MacroBar label="Protein" current={totals.proteinG} target={t.proteinG} unit="g" color={colors.accent} />
        </Card>

        {/* Habits */}
        <Card style={{ gap: 8 }}>
          <Text variant="title3">Habits</Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <View style={{ alignItems: "center", flex: 1 }}><Text variant="title2">{habits?.steps.value ?? 0}</Text><Text variant="caption" color="tertiary">Steps</Text></View>
            <View style={{ alignItems: "center", flex: 1 }}><Text variant="title2">{habits?.water.value ?? 0}</Text><Text variant="caption" color="tertiary">Water (ml)</Text></View>
            <View style={{ alignItems: "center", flex: 1 }}><Text variant="title2">{habits?.sleep.value ?? 0}</Text><Text variant="caption" color="tertiary">Sleep (hrs)</Text></View>
          </View>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 16, marginBottom: 16 },
  settingsBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.backgroundCard, alignItems: "center", justifyContent: "center" },
});
