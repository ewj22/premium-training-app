import { ScrollView, View } from "react-native";
import { Screen, Text, Card, Badge, LoadingSpinner } from "@shared/components/ui";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@shared/lib/supabase";
import { colors } from "@shared/theme/tokens";

export function ClientDetailScreen({ route }: any) {
  const { clientId, clientName } = route.params;

  const { data, isLoading } = useQuery({
    queryKey: ["client-detail", clientId],
    queryFn: async () => {
      const [workouts, metrics, checkins] = await Promise.all([
        supabase.from("workout_sessions").select("id, title, status, scheduled_date, duration_seconds").eq("client_id", clientId).eq("status", "completed").order("scheduled_date", { ascending: false }).limit(5),
        supabase.from("body_metrics").select("weight_kg, recorded_date").eq("client_id", clientId).not("weight_kg", "is", null).order("recorded_date", { ascending: false }).limit(5),
        supabase.from("checkins").select("id, week_start_date, status, weight_kg, adherence_pct, client_notes, energy_rating, sleep_rating, stress_rating").eq("client_id", clientId).order("week_start_date", { ascending: false }).limit(3),
      ]);
      return {
        workouts: workouts.data ?? [],
        metrics: metrics.data ?? [],
        checkins: checkins.data ?? [],
      };
    },
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text variant="largeTitle" style={{ marginTop: 8, marginBottom: 16 }}>{clientName}</Text>

        {/* Weight */}
        <Text variant="title3" style={{ marginBottom: 8 }}>⚖️ Weight History</Text>
        <Card style={{ gap: 6, marginBottom: 16 }}>
          {(data?.metrics ?? []).length === 0 ? <Text variant="subhead" color="tertiary">No weight data yet</Text> : (
            (data?.metrics ?? []).map((m: any, i: number) => (
              <View key={i} style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text variant="footnote" color="secondary">{m.recorded_date}</Text>
                <Text variant="footnote">{m.weight_kg}kg</Text>
              </View>
            ))
          )}
        </Card>

        {/* Recent workouts */}
        <Text variant="title3" style={{ marginBottom: 8 }}>🏋️ Recent Workouts</Text>
        <Card style={{ gap: 8, marginBottom: 16 }}>
          {(data?.workouts ?? []).length === 0 ? <Text variant="subhead" color="tertiary">No workouts yet</Text> : (
            (data?.workouts ?? []).map((w: any) => (
              <View key={w.id} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text variant="subhead">{w.title}</Text>
                <Text variant="caption" color="secondary">{w.scheduled_date}</Text>
              </View>
            ))
          )}
        </Card>

        {/* Check-ins */}
        <Text variant="title3" style={{ marginBottom: 8 }}>✅ Check-ins</Text>
        {(data?.checkins ?? []).length === 0 ? (
          <Card><Text variant="subhead" color="tertiary">No check-ins yet</Text></Card>
        ) : (
          (data?.checkins ?? []).map((ci: any) => (
            <Card key={ci.id} style={{ gap: 6, marginBottom: 8 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text variant="headline">Week of {ci.week_start_date}</Text>
                <Badge label={ci.status} tone={ci.status === "reviewed" ? "success" : "primary"} />
              </View>
              {ci.weight_kg && <Text variant="footnote" color="secondary">Weight: {ci.weight_kg}kg</Text>}
              {ci.adherence_pct && <Text variant="footnote" color="secondary">Adherence: {ci.adherence_pct}%</Text>}
              <View style={{ flexDirection: "row", gap: 16 }}>
                {ci.energy_rating && <Text variant="caption" color="tertiary">Energy: {ci.energy_rating}/5</Text>}
                {ci.sleep_rating && <Text variant="caption" color="tertiary">Sleep: {ci.sleep_rating}/5</Text>}
                {ci.stress_rating && <Text variant="caption" color="tertiary">Stress: {ci.stress_rating}/5</Text>}
              </View>
              {ci.client_notes && <Text variant="footnote" color="secondary" style={{ marginTop: 4 }}>{ci.client_notes}</Text>}
            </Card>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}
