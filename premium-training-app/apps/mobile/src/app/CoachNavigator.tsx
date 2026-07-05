import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { CoachClientsScreen } from "./screens/coach/CoachClientsScreen";
import { ClientDetailScreen } from "./screens/coach/ClientDetailScreen";
import { CoachProfileScreen } from "./screens/coach/CoachProfileScreen";
import { ConversationsListScreen } from "./screens/main/messaging/ConversationsListScreen";
import { ChatScreen } from "./screens/main/messaging/ChatScreen";
import { HomeIcon, ChatIcon } from "@shared/components/ui/TabIcon";
import Svg, { Path, Circle } from "react-native-svg";
import { colors } from "@shared/theme/tokens";

// Simple coach-specific icons
function UsersIcon({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <Circle cx="9" cy="7" r="4" />
      <Path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </Svg>
  );
}

function UserIcon({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <Circle cx="12" cy="7" r="4" />
    </Svg>
  );
}

// Clients stack
const ClientsStack = createNativeStackNavigator();
const innerOpts = {
  headerShown: true, headerBackTitle: "Back",
  headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.primary,
  headerTitleStyle: { color: colors.textPrimary }, headerShadowVisible: false, title: "",
};

function ClientsNavigator() {
  return (
    <ClientsStack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <ClientsStack.Screen name="ClientsList" component={CoachClientsScreen} />
      <ClientsStack.Screen name="ClientDetail" component={ClientDetailScreen} options={innerOpts} />
    </ClientsStack.Navigator>
  );
}

// Messages stack (reuse client messaging screens)
const MsgStack = createNativeStackNavigator();
function CoachMessagesNavigator() {
  return (
    <MsgStack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <MsgStack.Screen name="ConversationsList" component={ConversationsListScreen} />
      <MsgStack.Screen name="Chat" component={ChatScreen} options={innerOpts} />
    </MsgStack.Navigator>
  );
}

const Tab = createBottomTabNavigator();

export function CoachNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.borderSubtle, paddingTop: 4 },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: { fontSize: 11, marginTop: 2 },
      }}
    >
      <Tab.Screen name="Clients" component={ClientsNavigator} options={{ tabBarIcon: ({ color }) => <UsersIcon color={color} /> }} />
      <Tab.Screen name="Messages" component={CoachMessagesNavigator} options={{ tabBarIcon: ({ color }) => <ChatIcon color={color} size={22} /> }} />
      <Tab.Screen name="Profile" component={CoachProfileScreen} options={{ tabBarIcon: ({ color }) => <UserIcon color={color} /> }} />
    </Tab.Navigator>
  );
}
