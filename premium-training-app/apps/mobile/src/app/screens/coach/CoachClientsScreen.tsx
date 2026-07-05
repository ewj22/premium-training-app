import { FlatList, Pressable, View } from "react-native";
import { Screen, Text, Card, Avatar, EmptyState, LoadingSpinner } from "@shared/components/ui";
import { useProfile } from "@shared/lib/authStore";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@shared/lib/supabase";

interface ClientRow {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  status: string;
}

function useCoachClients() {
  const profile = useProfile();
  return useQuery({
    queryKey: ["coach-clients", profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coach_clients")
        .select("client_id, status, profiles!coach_clients_client_id_fkey(full_name, avatar_url)")
        .eq("coach_id", profile!.id)
        .eq("archived", false);
      if (error) throw error;
      return (data ?? []).map((row: any) => ({
        id: row.client_id,
        fullName: row.profiles?.full_name ?? "Client",
        avatarUrl: row.profiles?.avatar_url,
        status: row.status,
      })) as ClientRow[];
    },
    enabled: !!profile?.id,
  });
}

export function CoachClientsScreen({ navigation }: any) {
  const { data: clients, isLoading } = useCoachClients();

  if (isLoading) return <LoadingSpinner />;

  return (
    <Screen>
      <Text variant="largeTitle" style={{ marginTop: 16, marginBottom: 16 }}>👥 My Clients</Text>
      <FlatList
        data={clients}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
        ListEmptyComponent={<EmptyState title="No clients yet" description="Share your coach ID with clients so they can connect during onboarding." />}
        renderItem={({ item }) => (
          <Pressable onPress={() => navigation.navigate("ClientDetail", { clientId: item.id, clientName: item.fullName })}>
            <Card style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
              <Avatar fullName={item.fullName} uri={item.avatarUrl} size={48} />
              <View style={{ flex: 1 }}>
                <Text variant="headline">{item.fullName}</Text>
                <Text variant="caption" color="secondary">{item.status}</Text>
              </View>
              <Text variant="body" color="tertiary">›</Text>
            </Card>
          </Pressable>
        )}
      />
    </Screen>
  );
}
