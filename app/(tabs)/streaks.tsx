import { View ,Text ,StyleSheet } from "react-native";

export default function streaksScreen() {
  return <View style={styles.container}>
    <Text>this is the login page</Text>
         </View>;
 
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor:"coral",
  },
});
