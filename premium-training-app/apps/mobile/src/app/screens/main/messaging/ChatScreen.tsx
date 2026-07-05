import { useState, useEffect, useRef } from "react";
import { FlatList, View, TextInput, Pressable, StyleSheet } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { MessagesStackParamList } from "../../../MessagesNavigator";
import { Screen, Text } from "@shared/components/ui";
import { useProfile } from "@shared/lib/authStore";
import { useMessages, useSendMessage, useMarkRead } from "@features/messaging/hooks/useMessaging";

type Props = NativeStackScreenProps<MessagesStackParamList, "Chat">;

export function ChatScreen({ route }: Props) {
  const { conversationId, coachName } = route.params;
  const profile = useProfile();
  const { data: messages } = useMessages(conversationId);
  const sendMessage = useSendMessage();
  const markRead = useMarkRead();
  const [input, setInput] = useState("");
  const listRef = useRef<FlatList>(null);

  useEffect(() => { markRead.mutate(conversationId); }, [conversationId, messages?.length]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    sendMessage.mutate({ conversationId, body: trimmed });
    setInput("");
  };

  return (
    <Screen>
      <Text variant="title2" style={{ marginTop: 16, marginBottom: 12 }}>{coachName}</Text>
      <FlatList ref={listRef} data={messages} keyExtractor={(item) => item.id} contentContainerStyle={{ gap: 6, paddingBottom: 12 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item }) => {
          const isMe = item.senderId === profile?.id;
          return (
            <View style={{ flexDirection: "row", justifyContent: isMe ? "flex-end" : "flex-start" }}>
              <View style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}>
                <Text variant="body">{item.body}</Text>
                <Text variant="caption" color={isMe ? "primary" : "tertiary"} style={{ marginTop: 4 }}>
                  {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </Text>
              </View>
            </View>
          );
        }}
      />
      <View style={styles.inputRow}>
        <TextInput style={styles.chatInput} placeholder="Type a message..." placeholderTextColor="#636366" value={input} onChangeText={setInput} onSubmitEditing={handleSend} returnKeyType="send" />
        <Pressable onPress={handleSend} style={styles.sendBtn}><Text variant="headline">↑</Text></Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  bubble: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, maxWidth: "80%" },
  myBubble: { backgroundColor: "#0A84FF" },
  theirBubble: { backgroundColor: "#1C1C1F" },
  inputRow: { flexDirection: "row", gap: 8, alignItems: "center", paddingVertical: 12 },
  chatInput: { flex: 1, height: 40, paddingHorizontal: 16, borderRadius: 999, backgroundColor: "#1C1C1F", borderWidth: 1, borderColor: "#2A2A2E", color: "#FFFFFF" },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#0A84FF", alignItems: "center", justifyContent: "center" },
});
