import { Colors } from '@/constants/Colors';
import { Feather } from "@expo/vector-icons";
import { Stack, usePathname, useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { Image, Modal, Pressable, Text, TouchableOpacity, View, Alert, Platform, ActivityIndicator, StyleSheet } from "react-native";
import { AuthContext } from "@/utils/authContext";

const PlaceholderProfileImage = require("@/assets/images/broken-image-dark.png");

const API_URL =
  Platform.OS === "android"
    ? process.env.EXPO_PUBLIC_API_URL_ALTERNATIVE
    : process.env.EXPO_PUBLIC_API_URL;

type User = {
  id: string;
  mail: string;
  username: string;
  display_name: string;
  bio: string;
  profile_pic: string;
};

export default function ProfileLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { token } = useContext(AuthContext);

  const [modalVisible, setModalVisible] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const getRoute = (name: string) => {
    if (!user?.username) return "/users";
    return name === "index"
      ? `/users/${user.username}`
      : `/users/${user.username}/${name}`;
  };
  const isActive = (name: string) => pathname === getRoute(name);

  const handleUnfriend = () => {
    Alert.alert(
      "Unfriend",
      "Are you sure you want to unfriend this user?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Unfriend", 
          style: "destructive",
          onPress: () => {
            console.log("Unfriending user...");
            Alert.alert("Success", "User has been unfriended.");
          }
        }
      ]
    );
  };

  const handleCalculateMatchRate = () => {
    console.log("Calculating match rate...");
    setTimeout(() => {
      const matchRate = Math.floor(Math.random() * 100) + 1;
      Alert.alert("Match Rate", `Your compatibility score is ${matchRate}%`);
    }, 1000);
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/users/${user?.username}`, {
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
        setUser(data.user);
      } catch (err) {
        console.log("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={Colors.light.textPurple} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.profileCardContainer}>
        <View style={styles.profileCard}>
          <Text style={styles.displayName}>{user?.display_name ?? "Unknown"}</Text>
          <View style={{position: 'absolute', width: 132, height: 132, backgroundColor: Colors.light.textPink, borderRadius: 100, left: -16, bottom: -60}}>
            <Pressable
              onPress={() => router.navigate(getRoute("index"))}
              style={[styles.tabItem, isActive("index") && styles.activeTab]}
            >
              <Text style={[styles.tabText, isActive("index") && styles.activeText]}>
                Creator
              </Text>
            </Pressable>
          </View>
          <View style={{position: 'absolute', width: 132, height: 132, backgroundColor: Colors.light.textPink, borderRadius: 100, right: -16, bottom: -60}}>
            <Pressable
              onPress={() => router.navigate(getRoute("personal"))}
              style={[styles.tabItem, isActive("personal") && styles.activeTab]}
            >
              <Text style={[styles.tabText, isActive("personal") && styles.activeText]}>
                Personal
              </Text>
            </Pressable>
          </View>
        </View>
        <Image
          source={user?.profile_pic ? { uri: user.profile_pic } : PlaceholderProfileImage}
          style={styles.profileImage}
          defaultSource={PlaceholderProfileImage}
          onError={(e) =>
            console.log("Image failed to load:", e.nativeEvent.error)
          }
        />
        <View style={{position: "absolute", top: 12, right: 18, display: 'flex', flexDirection: 'row', gap: 8}}>
          <TouchableOpacity 
            // onPress={() => setModalVisible(true)}
          >
            <Feather name="bookmark" size={28} color={Colors.light.textPurple} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setModalVisible(true)}
          >
            <Feather name="menu" size={28} color={Colors.light.textPurple} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={{display: "flex", alignItems: "center", justifyContent: 'center', paddingTop: 80, backgroundColor: Colors.light.mainBackgroundColor, zIndex: -1}}>
        <View style={{display: "flex", gap: 4, alignItems: "center", paddingHorizontal: 20, paddingVertical: 10}}>
          <Text style={{color: Colors.light.profileText, fontFamily: 'Milkyway', fontSize: 26}}>
            @{user?.username ?? "unknown"}
          </Text>
          <Text style={{color: Colors.light.profileText, fontFamily: 'Milkyway', fontSize: 16}}>
            {user?.mail}
          </Text>
          <Text style={{color: Colors.light.profileText, fontFamily: 'Milkyway', fontSize: 16, textAlign: 'center',}}>
            {user?.bio ?? "This user has no bio."}
          </Text>
        </View>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  profileCardContainer: {
    backgroundColor: Colors.light.cardBackgroundColor,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: "relative",
  },
  profileCard: {
    display: "flex",
    position: "relative",
    paddingHorizontal: 20,
    gap: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.textPink,
    width: '100%',
    height: 200,
  },
  displayName: {
    fontSize: 38,
    color: Colors.light.whiteText,
    fontFamily: 'Milkyway',
    marginBottom: 42,
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: Colors.light.cardBackgroundColor,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.iconLight,
  },
  tabText: {
    color: Colors.light.gradientPurpleDark,
    fontSize: 22,
    textAlign: 'center',
    fontFamily: 'Milkyway',
  },
  tabItem: {
    marginBottom: 3,
    marginTop: 46,
    marginLeft: 20,
    marginRight: 20,
  },
  activeTab: {
    backgroundColor: Colors.light.mainBackgroundColor,
    borderRadius: 100,
  },
  activeText: {
    color: Colors.light.textPurple,
    fontWeight: "bold",
  },
  profileImage: {
    width: 162,
    height: 162,
    borderRadius: 200,
    position: 'absolute',
    borderColor: Colors.light.mainBackgroundColor,
    borderWidth: 10,
    top: 110,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.mainBackgroundColor,
    paddingHorizontal: 16,
    borderRadius: 42,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,

    // Android shadow
    elevation: 3,
  },
  buttonText: {
    fontSize: 24,
    color: Colors.light.textPink,
    fontFamily: 'Milkyway',
  },
});