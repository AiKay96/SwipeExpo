import { StyleSheet, Text, View } from "react-native";
import { Colors } from '@/constants/Colors';

export default function CreatorScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Creator</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.light.cardBackgroundColor, },
  text: { color: "#080e0e" },
});