import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { useSession, useProfile, useAuthStore } from "@shared/lib/authStore";
import { LoadingSpinner } from "@shared/components/ui";
import { AuthNavigator } from "./AuthNavigator";
import { MainNavigator } from "./MainNavigator";
import { CoachNavigator } from "./CoachNavigator";
import { OnboardingScreen } from "./screens/auth/OnboardingScreen";
import { colors } from "@shared/theme/tokens";

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.background,
    border: colors.borderSubtle,
    primary: colors.primary,
  },
};

/**
 * Four states:
 * 1. Initializing → spinner
 * 2. No session → AuthNavigator
 * 3. Session but onboarding incomplete → OnboardingScreen
 * 4. Session + onboarded + role=coach → CoachNavigator
 * 5. Session + onboarded + role=client → MainNavigator (client tabs)
 */
export function RootNavigator() {
  const session = useSession();
  const profile = useProfile();
  const isInitializing = useAuthStore((s) => s.isInitializing);

  if (isInitializing) return <LoadingSpinner message="Loading..." />;

  return (
    <NavigationContainer theme={navTheme}>
      {!session ? (
        <AuthNavigator />
      ) : !profile?.onboardingCompleted ? (
        <OnboardingScreen />
      ) : profile.role === "coach" ? (
        <CoachNavigator />
      ) : (
        <MainNavigator />
      )}
    </NavigationContainer>
  );
}
