/**
 * Root Layout Component
 * Copyright (c) 2025 - All rights reserved
 * This is original code for this project
 */
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { Stack, useRouter, useSegments } from "expo-router";
import type { ReactNode } from "react";
import { Fragment, useEffect } from "react";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";

interface RouteGuardProps {
  children: ReactNode;
}

// Custom authentication guard implementation
function RouteGuard({ children }: RouteGuardProps) {
  const router = useRouter();
  const { user, isLoadingUser } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (isLoadingUser) return; // Wait for auth check to complete

    const isAuthGroup = segments[0] === "auth";
    const isSplashScreen = segments[0] === "SplashScreen";

    // Don't redirect if on splash screen
    if (isSplashScreen) return;

    if (!user && !isAuthGroup) {
      router.replace("/auth");
    } else if (user && isAuthGroup) {
      router.replace("/");
    }
  }, [user, isLoadingUser, segments]);

  return <Fragment>{children}</Fragment>;
}
export default function RootLayout() {
  return (
    <AuthProvider>
      <PaperProvider>
        <SafeAreaProvider>
          <RouteGuard>
          <Stack initialRouteName="SplashScreen">
            <Stack.Screen name="SplashScreen" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="auth" options={{ headerShown: false }} />
          </Stack>
          </RouteGuard>
        </SafeAreaProvider>
      </PaperProvider>
    </AuthProvider>
  );
}

