import { useLocalSearchParams } from "expo-router";
import { useEffect, useState, useContext } from "react";
import { View, Text, Image, ActivityIndicator, StyleSheet, Platform } from "react-native";
import { AuthContext } from "@/utils/authContext";

const API_URL =
  Platform.OS === "android"
    ? process.env.EXPO_PUBLIC_API_URL_ALTERNATIVE
    : process.env.EXPO_PUBLIC_API_URL;

export type User = {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  profile_pic: string | null;
  friend_status: "not_friends" | "friends" | "pending";
  is_following: boolean;
  match_rate: number;
  overlap_categories: string[];
};

export async function getUser(username: string, token: string) {
  const res = await fetch(`${API_URL}/users/${username}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}

export default function ProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const { token } = useContext(AuthContext);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      if (!token) return;
      try {
        const data = await getUser(username, token);
        setUser(data.user);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [username, token]);

  if (loading) return <ActivityIndicator size="large" />;
  if (!user) return <Text>User not found</Text>;

  return (
    <View style={styles.container}>
      {user.profile_pic ? (
        <Image source={{ uri: user.profile_pic }} style={styles.profileImage} />
      ) : (
        <Text>No profile picture</Text>
      )}
      <Text style={styles.username}>@{user.username}</Text>
      <Text style={styles.displayName}>{user.display_name}</Text>
      <Text style={styles.bio}>{user.bio}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", padding: 20 },
  profileImage: { width: 120, height: 120, borderRadius: 60 },
  username: { fontSize: 20, fontWeight: "bold", marginTop: 10 },
  displayName: { fontSize: 18, color: "gray" },
  bio: { marginTop: 10, textAlign: "center" },
});
