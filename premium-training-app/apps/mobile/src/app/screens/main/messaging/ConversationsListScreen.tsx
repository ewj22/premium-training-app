import { FlatList, Pressable } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { MessagesStackParamList } from "../../../MessagesNavigator";
import { Screen, Text, Card, Avatar, EmptyState, LoadingSpinner } from "@shared/components/ui";
import { useConversations } from "@features/messaging/hooks/useMessaging";

type Props = NativeStackScreenProps<MessagesStackParamList, "ConversationsList">;

export function ConversationsListScreen({ navigation }: Props) {
  const { data: conversations, isLoading } = useConversations();
  if (isLoading) return <LoadingSpinner />;

  return (
    <Screen>
      <Text variant="largeTitle" style={{ marginTop: 16, marginBottom: 16 }}>Messages</Text>
      <FlatList data={conversations} keyExtractor={(item) => item.id} contentContainerStyle={{ gap: 8, paddingBottom: 24 }}
        ListEmptyComponent={<EmptyState title="No conversations yet" description="Once your coach is connected, your chat will appear here." />}
        renderItem={({ item }) => (
          <Pressable onPress={() => navigation.navigate("Chat", { conversationId: item.id, coachName: item.coachName })}>
            <Card style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Avatar fullName={item.coachName} size={44} />
              <Text variant="headline">{item.coachName}</Text>
            </Card>
          </Pressable>
        )}
      />
    </Screen>
  );
}
