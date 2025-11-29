import { useAuth } from "@/lib/auth-context";
import { Text, View ,StyleSheet } from "react-native";
import { Button } from "react-native-paper";
export default function Index() {
  const {signOut} = useAuth();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>this is home page </Text>
      <Button mode="text" onPress={signOut} icon={"logout"}>sign out</Button>
    </View>
  );
}

