import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { DashboardNavigator } from "./DashboardNavigator";
import { WorkoutsNavigator } from "./WorkoutsNavigator";
import { NutritionNavigator } from "./NutritionNavigator";
import { ProgressNavigator } from "./ProgressNavigator";
import { MessagesNavigator } from "./MessagesNavigator";
import { HomeIcon, DumbbellIcon, ForkKnifeIcon, TrendingUpIcon, ChatIcon } from "@shared/components/ui/TabIcon";
import { colors } from "@shared/theme/tokens";

export type MainTabParamList = {
  Dashboard: undefined;
  Workouts: undefined;
  Nutrition: undefined;
  Progress: undefined;
  Messages: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainNavigator() {
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
      <Tab.Screen name="Dashboard" component={DashboardNavigator} options={{ tabBarIcon: ({ color }) => <HomeIcon color={color} size={22} /> }} />
      <Tab.Screen name="Workouts" component={WorkoutsNavigator} options={{ tabBarIcon: ({ color }) => <DumbbellIcon color={color} size={22} /> }} />
      <Tab.Screen name="Nutrition" component={NutritionNavigator} options={{ tabBarIcon: ({ color }) => <ForkKnifeIcon color={color} size={22} /> }} />
      <Tab.Screen name="Progress" component={ProgressNavigator} options={{ tabBarIcon: ({ color }) => <TrendingUpIcon color={color} size={22} /> }} />
      <Tab.Screen name="Messages" component={MessagesNavigator} options={{ tabBarIcon: ({ color }) => <ChatIcon color={color} size={22} /> }} />
    </Tab.Navigator>
  );
}
