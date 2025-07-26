import { AuthContext } from "@/utils/authContext";
import { Link } from "expo-router";
import { useContext, useState } from "react";
import {
  Alert,
  Button,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function SignInScreen() {
  const { logIn } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = async () => {
    const success = await logIn(username, password);
    if (!success) {
      Alert.alert("Sign-in failed", "Check your username or password.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Sign In</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Sign In" onPress={handleSignIn} />
      <Link href="/create-account" style={styles.button}>
        Create Account
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  text: { fontSize: 24, marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 12,
    padding: 10,
    borderRadius: 4,
  },
  button: { marginTop: 20, color: "blue" },
});
