import { Colors } from '@/constants/Colors';
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
      <View>
        <Text style={styles.text}>Sign In</Text>
      </View>
      <View>
        <TextInput
          style={styles.input}
          placeholder="Username"
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
          placeholderTextColor={Colors.light.referenceText}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholderTextColor={Colors.light.referenceText}
        />
        <Button title="Sign In" onPress={handleSignIn} color={Colors.light.gradientBlue} />
        <Link href="/create-account" style={styles.button}>
          Create Account
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    display: "flex",
    justifyContent: "center",
    height: "100%",
    padding: 40,
    gap: 24,
    paddingBottom: 180,
  },
  text: { 
    fontSize: 32, 
    fontWeight: "500",
    color: Colors.light.textPurple,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.light.textPurple,
    color: Colors.light.referenceText,
    padding: 10,
    borderRadius: 4,
    marginBottom: 12,
  },
  button: { 
    marginTop: 20, 
    color: Colors.light.gradientPurpleDark
  },
});
