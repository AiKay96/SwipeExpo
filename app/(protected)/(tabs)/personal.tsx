import { StyleSheet, Text, View } from "react-native";

export default function PersonalScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Personal</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  text: {
    color: "#080e0e",
  },
});