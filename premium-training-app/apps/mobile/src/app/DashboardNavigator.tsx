import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { DashboardScreen } from "./screens/main/DashboardScreen";
import { SettingsScreen } from "./screens/main/settings/SettingsScreen";
import { EditProfileScreen } from "./screens/main/settings/EditProfileScreen";
import { CoachInsightsScreen } from "./screens/main/insights/CoachInsightsScreen";
import { WeeklyReviewScreen } from "./screens/main/insights/WeeklyReviewScreen";
import { AchievementsScreen } from "./screens/main/insights/AchievementsScreen";
import { colors } from "@shared/theme/tokens";

export type DashboardStackParamList = {
  DashboardHome: undefined;
  Settings: undefined;
  EditProfile: undefined;
  CoachInsights: undefined;
  WeeklyReview: undefined;
  Achievements: undefined;
};

const Stack = createNativeStackNavigator<DashboardStackParamList>();

const innerScreenOptions = {
  headerShown: true, headerBackTitle: "Back",
  headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.primary,
  headerTitleStyle: { color: colors.textPrimary }, headerShadowVisible: false, title: "",
};

export function DashboardNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="DashboardHome" component={DashboardScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={innerScreenOptions} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={innerScreenOptions} />
      <Stack.Screen name="CoachInsights" component={CoachInsightsScreen} options={innerScreenOptions} />
      <Stack.Screen name="WeeklyReview" component={WeeklyReviewScreen} options={innerScreenOptions} />
      <Stack.Screen name="Achievements" component={AchievementsScreen} options={innerScreenOptions} />
    </Stack.Navigator>
  );
}
