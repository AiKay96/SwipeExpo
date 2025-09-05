import { Colors } from '@/constants/Colors';
import { AuthContext } from "@/utils/authContext";
import { AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  Image,
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
    profile_pic: "",
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null); // web-only

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
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch profile");

        const json = await res.json();
        setUserData({
          username: json.user.username,
          display_name: json.user.display_name,
          bio: json.user.bio,
          profile_pic: json.user.profile_pic,
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

  const contentTypeFromName = (nameOrType: string) => {
    const lower = (nameOrType || '').toLowerCase();
    if (lower.includes('image/jpeg') || lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
    if (lower.includes('image/png') || lower.endsWith('.png')) return 'image/png';
    if (lower.includes('image/webp') || lower.endsWith('.webp')) return 'image/webp';
    if (lower.includes('image/gif')  || lower.endsWith('.gif'))  return 'image/gif';
    return 'image/jpeg';
  };

  const uploadImageBinary = async (opts: { nativeUri?: string; webFile?: any }) => {
    try {
      setUploadingImage(true);
      const token = await getToken();
      if (!token) throw new Error("Token not found");

      const url = `${API_URL}/media`;
      const headers = { Authorization: `Bearer ${token}` };

      if (Platform.OS === 'web' && opts.webFile) {
        const file: File = opts.webFile;
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': contentTypeFromName(file.type || file.name),
          },
          body: file,
        });
        if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
        const body = await res.json();
        setUserData((prev) => ({ ...prev, profile_pic: body.url }));
        return;
      }

      if (opts.nativeUri) {
        const res = await FileSystem.uploadAsync(url, opts.nativeUri, {
          httpMethod: 'POST',
          headers: {
            ...headers,
            'Content-Type': contentTypeFromName(opts.nativeUri),
          },
          uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
        });
        if (res.status !== 200) throw new Error(`Upload failed: ${res.status}`);
        const body = JSON.parse(res.body);
        setUserData((prev) => ({ ...prev, profile_pic: body.url }));
        return;
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert("Error", "Failed to upload profile photo.");
    } finally {
      setUploadingImage(false);
    }
  };

  const pickImageNative = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "We need media library permission.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.9,
    });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      await uploadImageBinary({ nativeUri: uri });
    }
  };

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
      {/* Close Button */}
      <TouchableOpacity style={{position: "absolute", top: 16, right: 16}} onPress={onClose}>
        <AntDesign name="closecircle" size={32} color={Colors.light.iconDark} />
      </TouchableOpacity>

      {/* Profile Image */}
      <TouchableOpacity onPress={Platform.OS === "web" ? () => fileInputRef.current?.click() : pickImageNative}>
        {userData.profile_pic ? (
          <Image source={{ uri: userData.profile_pic }} style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 20 }} />
        ) : (
          <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.light.referenceText, alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <Text style={{ color: Colors.light.profileText }}>Pick Photo</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Web hidden file input */}
      {Platform.OS === "web" && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = (e.target as HTMLInputElement)?.files?.[0];
            if (file) uploadImageBinary({ webFile: file });
          }}
        />
      )}

      {/* Username */}
      <Text style={styles.label}>Username</Text>
      <TextInput
        style={styles.input}
        value={userData.username}
        onChangeText={(text) => setUserData({ ...userData, username: text })}
      />

      {/* Display Name */}
      <Text style={styles.label}>Display Name</Text>
      <TextInput
        style={styles.input}
        value={userData.display_name}
        onChangeText={(text) => setUserData({ ...userData, display_name: text })}
      />

      {/* Bio */}
      <Text style={styles.label}>Bio</Text>
      <TextInput
        style={[styles.input, styles.bio]}
        multiline
        value={userData.bio}
        onChangeText={(text) => setUserData({ ...userData, bio: text })}
      />

      {/* Buttons */}
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
