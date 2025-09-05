import { Redirect } from "expo-router";
import { AuthContext } from "@/utils/authContext";
import { useEffect, useState, useContext } from "react";
import { Platform } from "react-native";

const API_URL =
  Platform.OS === "android"
    ? process.env.EXPO_PUBLIC_API_URL_ALTERNATIVE
    : process.env.EXPO_PUBLIC_API_URL;

export default function CreatorScreen() {
  const { token } = useContext(AuthContext);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    const fetchMe = async () => {
      try {
        const res = await fetch(`${API_URL}/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          console.log("Failed to fetch user:", await res.text());
          return;
        }

        const data = await res.json();
        setUsername(data.user.username);
      } catch (err) {
        console.log("Error fetching user:", err);
      }
    };

    fetchMe();
  }, [token]);

  if (!username) return null;

  return <Redirect href={`/profile/${username}`} />;
}