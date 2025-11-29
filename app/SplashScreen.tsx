import { useAuth } from "@/lib/auth-context";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";

export default function SplashScreenComponent() {
  const router = useRouter();
  const { user, isLoadingUser } = useAuth();

  useEffect(() => {
    if (!isLoadingUser) {
      // Wait a bit to show the splash screen
      const timer = setTimeout(() => {
        if (user) {
          router.replace("/(tabs)");
        } else {
          router.replace("/auth");
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [user, isLoadingUser]);

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/splash-icon.png")}
        style={styles.logo}
      />
      {/* <Text variant="headlineLarge" style={styles.title}>
        Habit Tracker
      </Text> */}
      <ActivityIndicator size="large" color="#6200ee" style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: "contain",
  },
  title: {
    marginTop: 24,
    fontWeight: "bold",
    color: "#6200ee",
  },
  loader: {
    marginTop: 32,
  },
});
