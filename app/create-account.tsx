import axios from "axios";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Button, Platform, StyleSheet, Text, TextInput, View } from "react-native";

// const API_URL = process.env.EXPO_PUBLIC_API_URL;
const API_URL = Platform.OS === 'android' ? process.env.EXPO_PUBLIC_API_URL_ALTERNATIVE : process.env.EXPO_PUBLIC_API_URL;

export default function CreateAccountScreen() {
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleRegister = async () => {
    try {
      const response = await axios.post(`${API_URL}/users`, {
        mail,
        password,
      });

      Alert.alert("Success", "Account created successfully!");
      console.log("Registered:", response.data);

      setTimeout(() => {
        router.replace("/sign-in");
      }, 1000);

    } catch (error: any) {
      console.log("Axios Error:", JSON.stringify(error, null, 2));

      // if (error.response) {
      //   // Server responded with a status outside 2xx
      //   console.log("Server response data:", error.response.data);
      //   console.log("Status code:", error.response.status);
      // } else if (error.request) {
      //   // Request was made but no response received
      //   console.log("📭 No response received:", error.request);
      // } else {
      //   // Something else happened
      //   console.log("Error setting up request:", error.message);
      // }

      // Alert.alert("Registration failed", error.message || "Unknown error");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Create Account</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#ccc"
        onChangeText={setMail}
        value={mail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#ccc"
        onChangeText={setPassword}
        value={password}
        secureTextEntry
      />
      <Button title="Register" onPress={handleRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0b0e16",
    paddingHorizontal: 20,
  },
  text: {
    color: "white",
    marginBottom: 20,
    fontSize: 18,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#555",
    backgroundColor: "#1c1f26",
    color: "white",
    padding: 10,
    marginVertical: 10,
    borderRadius: 8,
  },
});