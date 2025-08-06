import { Colors } from '@/constants/Colors';
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
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.text}>Create Account</Text>
      </View>
      <View>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={Colors.light.referenceText}
          onChangeText={setMail}
          value={mail}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={Colors.light.referenceText}
          onChangeText={setPassword}
          value={password}
          secureTextEntry
        />
        <Button title="Register" onPress={handleRegister} color={Colors.light.gradientBlue} />
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
    marginBottom: 12,
    padding: 10,
    borderRadius: 4,
  },
  button: { 
    marginTop: 20, 
    color: Colors.light.gradientPurpleDark
  },
});