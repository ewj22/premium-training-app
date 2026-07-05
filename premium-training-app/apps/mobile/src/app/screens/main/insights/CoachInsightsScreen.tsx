import { FlatList, View, StyleSheet } from "react-native";
import { Screen, Text, Card, LoadingSpinner, EmptyState } from "@shared/components/ui";
import { useCoachInsights } from "@features/insights/hooks/useInsights";
import { colors } from "@shared/theme/tokens";

const priorityColors = { high: colors.danger, medium: colors.warning, low: colors.accent };
const typeEmojis = { strength_gain: "📈", consistency: "📊", plateau: "⚠️", volume: "📦", recommendation: "💡" };

export function CoachInsightsScreen() {
  const { data: insights, isLoading } = useCoachInsights();
  if (isLoading) return <LoadingSpinner />;

  return (
    <Screen>
      <Text variant="largeTitle" style={{ marginTop: 16, marginBottom: 16 }}>Coach Insights</Text>
      <FlatList
        data={insights}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
        ListEmptyComponent={<EmptyState title="No insights yet" description="Complete a few weeks of training and insights will appear here automatically." />}
        renderItem={({ item }) => (
          <Card style={{ flexDirection: "row", gap: 12 }}>
            <Text variant="title2">{typeEmojis[item.type] ?? "📋"}</Text>
            <View style={{ flex: 1 }}>
              <Text variant="body">{item.message}</Text>
              <View style={[styles.priorityDot, { backgroundColor: priorityColors[item.priority] }]} />
            </View>
          </Card>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  priorityDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
});
