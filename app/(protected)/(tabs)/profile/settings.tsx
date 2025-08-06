import { Colors } from '@/constants/Colors';
import { AuthContext } from "@/utils/authContext";
import { AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

const API_URL =
  Platform.OS === "android"
    ? process.env.EXPO_PUBLIC_API_URL_ALTERNATIVE
    : process.env.EXPO_PUBLIC_API_URL;

type Props = {
  onClose: () => void;
};

export default function SettingsModalContent({ onClose }: Props) {
  const authState = useContext(AuthContext);

  const [userData, setUserData] = useState({
    username: "",
    display_name: "",
    bio: "",
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const getToken = async (): Promise<string | null> => {
    try {
      const value = await AsyncStorage.getItem("auth-key");
      if (value) {
        const parsed = JSON.parse(value);
        return parsed.token;
      }
    } catch (error) {
      console.error("Error getting token from storage:", error);
    }
    return null;
  };

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        if (!token) throw new Error("Token not found");

        const res = await fetch(`${API_URL}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch profile");

        const json = await res.json();
        setUserData({
          username: json.user.username,
          display_name: json.user.display_name,
          bio: json.user.bio,
        });
      } catch (err) {
        console.error(err);
        Alert.alert("Error", "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("Token not found");

      const res = await fetch(`${API_URL}/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      if (!res.ok) throw new Error("Update failed");

      Alert.alert("Success", "Profile updated!");
    } catch (err) {
      console.error("Update error:", err);
      Alert.alert("Error", "Failed to update profile.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={Colors.light.gradientPink} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={{position: "absolute", top: 1, right: 1}}>
        <TouchableOpacity 
          style={{position: "absolute", top: 16, right: 16}}
          onPress={onClose}
        >
          <AntDesign name="closecircle" size={32} color={Colors.light.iconDark} />
        </TouchableOpacity>
      </View>
      <Text style={styles.label}>Username</Text>
      <TextInput
        style={styles.input}
        value={userData.username}
        onChangeText={(text) => setUserData({ ...userData, username: text })}
        placeholder="Username"
        placeholderTextColor={Colors.light.referenceText}
      />

      <Text style={styles.label}>Display Name</Text>
      <TextInput
        style={styles.input}
        value={userData.display_name}
        onChangeText={(text) => setUserData({ ...userData, display_name: text })}
        placeholder="Display Name"
        placeholderTextColor={Colors.light.referenceText}
      />

      <Text style={styles.label}>Bio</Text>
      <TextInput
        style={[styles.input, styles.bio]}
        multiline
        value={userData.bio}
        onChangeText={(text) => setUserData({ ...userData, bio: text })}
        placeholder="Your bio..."
        placeholderTextColor={Colors.light.referenceText}
      />
      <View style={{display: "flex", gap: 10, paddingTop: 10}}>
        <Button
          title={updating ? "Updating..." : "Update Profile"}
          onPress={handleUpdate}
          disabled={updating}
          color={Colors.light.gradientBlue}
        />
        <Button title="Log Out" onPress={authState.logOut} color={Colors.light.gradientPink} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    justifyContent: "center",
    position: "relative"
  },
  label: {
    color: Colors.light.textPurple,
    marginBottom: 4,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.light.textPurple,
    color: Colors.light.referenceText,
    padding: 10,
    borderRadius: 4,
  },
  bio: {
    height: 80,
    textAlignVertical: "top",
  },
});
