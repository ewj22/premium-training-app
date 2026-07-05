import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ProgressHomeScreen } from "./screens/main/progress/ProgressHomeScreen";
import { SubmitCheckinScreen } from "./screens/main/progress/SubmitCheckinScreen";
import { colors } from "@shared/theme/tokens";

export type ProgressStackParamList = {
  ProgressHome: undefined;
  SubmitCheckin: undefined;
};

const Stack = createNativeStackNavigator<ProgressStackParamList>();

const innerScreenOptions = {
  headerShown: true, headerBackTitle: "Back",
  headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.primary,
  headerTitleStyle: { color: colors.textPrimary }, headerShadowVisible: false, title: "",
};

export function ProgressNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="ProgressHome" component={ProgressHomeScreen} />
      <Stack.Screen name="SubmitCheckin" component={SubmitCheckinScreen} options={innerScreenOptions} />
    </Stack.Navigator>
  );
}
