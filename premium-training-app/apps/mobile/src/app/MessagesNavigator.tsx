import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ConversationsListScreen } from "./screens/main/messaging/ConversationsListScreen";
import { ChatScreen } from "./screens/main/messaging/ChatScreen";
import { colors } from "@shared/theme/tokens";

export type MessagesStackParamList = {
  ConversationsList: undefined;
  Chat: { conversationId: string; coachName: string };
};

const Stack = createNativeStackNavigator<MessagesStackParamList>();

const innerScreenOptions = {
  headerShown: true, headerBackTitle: "Back",
  headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.primary,
  headerTitleStyle: { color: colors.textPrimary }, headerShadowVisible: false, title: "",
};

export function MessagesNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="ConversationsList" component={ConversationsListScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} options={innerScreenOptions} />
    </Stack.Navigator>
  );
}
