import { FlatList, View, StyleSheet } from "react-native";
import { Screen, Text, Card, LoadingSpinner, EmptyState } from "@shared/components/ui";
import { useAchievements, useCheckAchievements } from "@features/insights/hooks/useInsights";
import { BADGE_DEFINITIONS } from "@features/insights/api/insightsApi";
import { colors } from "@shared/theme/tokens";
import { useEffect } from "react";

export function AchievementsScreen() {
  const { data: achievements, isLoading } = useAchievements();
  const checkAchievements = useCheckAchievements();

  // Check for new achievements on screen load
  useEffect(() => { checkAchievements.mutate(); }, []);

  if (isLoading) return <LoadingSpinner />;

  // Show all possible badges, earned ones highlighted
  const earnedKeys = new Set((achievements ?? []).map((a) => a.badgeKey));
  const allBadges = Object.entries(BADGE_DEFINITIONS).map(([key, def]) => ({
    key,
    ...def,
    earned: earnedKeys.has(key),
    earnedAt: achievements?.find((a) => a.badgeKey === key)?.earnedAt,
  }));

  return (
    <Screen>
      <Text variant="largeTitle" style={{ marginTop: 16, marginBottom: 16 }}>Achievements</Text>
      <Text variant="subhead" color="secondary" style={{ marginBottom: 16 }}>
        {earnedKeys.size} / {allBadges.length} earned
      </Text>
      <FlatList
        data={allBadges}
        keyExtractor={(item) => item.key}
        numColumns={2}
        columnWrapperStyle={{ gap: 8 }}
        contentContainerStyle={{ gap: 8, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <Card style={[styles.badge, !item.earned && styles.locked]}>
            <Text variant="title1" style={{ textAlign: "center" }}>{item.emoji}</Text>
            <Text variant="footnote" style={{ textAlign: "center" }} color={item.earned ? "primary" : "tertiary"}>{item.title}</Text>
            {item.earned && item.earnedAt && (
              <Text variant="caption" color="secondary" style={{ textAlign: "center" }}>
                {new Date(item.earnedAt).toLocaleDateString()}
              </Text>
            )}
          </Card>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  badge: { flex: 1, alignItems: "center", gap: 4, minHeight: 100, justifyContent: "center" },
  locked: { opacity: 0.35 },
});
