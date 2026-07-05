import { FlatList, View, StyleSheet } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { WorkoutsStackParamList } from "../../../WorkoutsNavigator";
import { Screen, Text, Card, EmptyState, LoadingSpinner } from "@shared/components/ui";
import { TrophyIcon } from "@shared/components/ui/TabIcon";
import { usePersonalBests } from "@features/workouts";
import { colors } from "@shared/theme/tokens";

type Props = NativeStackScreenProps<WorkoutsStackParamList, "PersonalBests">;

export function PersonalBestsScreen({}: Props) {
  const { data: pbs, isLoading } = usePersonalBests();

  if (isLoading) return <LoadingSpinner />;

  return (
    <Screen>
      <View style={styles.header}>
        <TrophyIcon color={colors.warning} size={28} />
        <Text variant="largeTitle" style={{ marginLeft: 8 }}>Personal Bests</Text>
      </View>
      <FlatList
        data={pbs}
        keyExtractor={(item) => item.exerciseId}
        contentContainerStyle={{ gap: 8, paddingBottom: 24 }}
        ListEmptyComponent={<EmptyState title="No PBs yet" description="Complete some workouts and your records will appear here." />}
        renderItem={({ item }) => (
          <Card>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flex: 1 }}>
                <Text variant="headline">{item.exerciseName}</Text>
                {item.achievedDate && (
                  <Text variant="caption" color="tertiary">{new Date(item.achievedDate).toLocaleDateString()}</Text>
                )}
              </View>
              <View style={styles.pbBadge}>
                <Text variant="title3" style={{ color: colors.warning }}>{item.bestWeightKg}kg</Text>
                {item.bestReps && <Text variant="footnote" color="secondary">× {item.bestReps}</Text>}
              </View>
            </View>
          </Card>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", marginTop: 16, marginBottom: 16 },
  pbBadge: { alignItems: "flex-end" },
});
