import "@shared/theme/global.css";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { queryClient } from "@shared/lib/queryClient";
import { useAuthListener } from "@features/auth/hooks/useAuth";
import { RootNavigator } from "./src/app/RootNavigator";

function AuthBootstrap({ children }: { children: React.ReactNode }) {
  // Mounted once — subscribes to Supabase auth state and syncs the Zustand store.
  useAuthListener();
  return <>{children}</>;
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthBootstrap>
            <StatusBar style="light" />
            <RootNavigator />
          </AuthBootstrap>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
