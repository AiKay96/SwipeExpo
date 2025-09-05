import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <ThemedView style={styles.container}>
        <Text>Error 404</Text>
        <ThemedText type="title">This screen does not exist.</ThemedText>
        <Link href="/" style={styles.link}>
          <ThemedText type="link">Go to home screen!</ThemedText>
        </Link>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});