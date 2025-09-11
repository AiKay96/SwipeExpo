import { useLocalSearchParams } from "expo-router";
import { useEffect, useState, useContext } from "react";
import { View, Text, Image, ActivityIndicator, StyleSheet, Platform } from "react-native";
import { AuthContext } from "@/utils/authContext";
import CreatorScreen from './creator';

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
    <CreatorScreen passedUsers={user} />
  );
}