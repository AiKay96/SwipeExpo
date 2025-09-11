import HorizontalProgress from "@/components/HorizontalProgress";
import { Colors } from "@/constants/Colors";
import { AuthContext } from "@/utils/authContext";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const PlaceholderProfileImage = require("@/assets/images/profile-image-example.jpg");

const API_URL =
  Platform.OS === "android"
    ? process.env.EXPO_PUBLIC_API_URL_ALTERNATIVE
    : process.env.EXPO_PUBLIC_API_URL;

type FriendStatus = "not_friends" | "friends" | "pending";

export interface FriendUser {
  id: string;
  username: string;
  display_name: string;
  friend_status: FriendStatus;
  is_following: boolean;
  mutual_friend_count: number;
  match_rate: number;
  overlap_categories: string[];
  profile_pic?: string;
  bio?: string;
}

export default function SuggestsScreen() {
  const { token } = useContext(AuthContext);
  const [friendRequestsData, setFriendRequestsData] = useState<FriendUser[]>([]);
  const [suggestionsData, setSuggestionsData] = useState<FriendUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const authFetch = async (url: string, options: RequestInit = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
    if (!res.ok) {
      throw new Error(`Request failed: ${res.status}`);
    }
    return res.json();
  };

  const fetchData = async () => {
    try {
      const [requestsRes, suggestionsRes] = await Promise.all([
        authFetch(`${API_URL}/friend-requests/incoming`),
        authFetch(`${API_URL}/friends/suggestions?limit=20`),
      ]);
      setFriendRequestsData(requestsRes.users || []);
      setSuggestionsData(suggestionsRes.users || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptFriend = async (id: string) => {
    try {
      await authFetch(`${API_URL}/friend-requests/accept`, {
        method: "POST",
        body: JSON.stringify({ to_user_id: id }),
      });
      setFriendRequestsData((prev) => prev.filter((req) => req.id !== id));
    } catch (err) {
      console.error("Error accepting friend request:", err);
    }
  };

  const handleRejectFriend = async (id: string) => {
    try {
      await authFetch(`${API_URL}/friend-requests/decline`, {
        method: "POST",
        body: JSON.stringify({ to_user_id: id }),
      });
      setFriendRequestsData((prev) => prev.filter((req) => req.id !== id));
    } catch (err) {
      console.error("Error declining friend request:", err);
    }
  };

  const handleInterested = async (id: string) => {
    try {
      await authFetch(`${API_URL}/friend-requests/send`, {
        method: "POST",
        body: JSON.stringify({ to_user_id: id }),
      });
      setSuggestionsData((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Error sending friend request:", err);
    }
  };

  const handleNotInterested = async (id: string) => {
    try {
      await authFetch(`${API_URL}/suggestions/skip`, {
        method: "POST",
        body: JSON.stringify({ target_id: id }),
      });
      setSuggestionsData((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Error skipping suggestion:", err);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.light.bioTextColor} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.fullContainer}>
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {friendRequestsData.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Friend Requests:</Text>
              {friendRequestsData.map((item) => (
                <FriendCard
                  key={item.id}
                  item={item}
                  type="request"
                  onAccept={handleAcceptFriend}
                  onReject={handleRejectFriend}
                />
              ))}
            </>
          )}

          {suggestionsData.length > 0 && (
            <>
              <Text
                style={[
                  styles.sectionTitle,
                  { marginTop: friendRequestsData.length > 0 ? 24 : 0 },
                ]}
              >
                Suggestions:
              </Text>
              {suggestionsData.map((item) => (
                <FriendCard
                  key={item.id}
                  item={item}
                  type="suggestion"
                  onAccept={handleInterested}
                  onReject={handleNotInterested}
                />
              ))}
            </>
          )}

          {friendRequestsData.length === 0 && suggestionsData.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                No friend requests or suggestions available
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

function FriendCard({
  item,
  type,
  onAccept,
  onReject,
}: {
  item: FriendUser;
  type: "request" | "suggestion";
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const rotation = useSharedValue(0);
  const translateX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      rotation.value = interpolate(event.translationX, [-100, 0, 100], [-15, 0, 15]);
    })
    .onEnd((event) => {
      const x = event.translationX;

      if (x > 50) {
        runOnJS(onAccept)(item.id);
      } else if (x < -50) {
        runOnJS(onReject)(item.id);
      }

      // Reset position
      translateX.value = withSpring(0);
      rotation.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { rotateZ: `${rotation.value}deg` },
    ],
  }));

  return (
    <View style={styles.requestCard}>
      <View style={styles.cardHeader}>
        <TouchableOpacity
          style={[type === "request" ? styles.rejectButton : styles.notInterestedButton, styles.pressableHearts]}
          onPress={() => onReject(item.id)}
        >
          <MaterialCommunityIcons name="heart-broken" size={74} color={Colors.light.logoPink} style={{position: 'absolute', top: -20, right: 4}} />
          <Text
            style={
              type === "request" ? styles.rejectText : styles.notInterestedText
            }
          >
            {type === "request" ? "Decline  " : "Skip"}
          </Text>
        </TouchableOpacity>
        <View style={styles.userInfo}>
          <Text style={styles.username}>{item.display_name}</Text>
        </View>
        <TouchableOpacity
          style={[ type === "request" ? styles.acceptButton : styles.interestedButton, styles.pressableHearts]}
          onPress={() => onAccept(item.id)}
        >
          <Ionicons name="heart" size={74} color={Colors.light.logoPink} style={{position: 'absolute', top: -20, right: 4}} />
          <Text
            style={
              type === "request" ? styles.acceptText : styles.interestedText
            }
          >
            {type === "request" ? "Accept  " : "Add Friend"}
          </Text>
        </TouchableOpacity>
      </View>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.imageContainer, animatedStyle]}>
          <Image
            source={item.profile_pic? item.profile_pic : PlaceholderProfileImage}
            style={styles.profileImage}
            defaultSource={PlaceholderProfileImage}
          />
        </Animated.View>
      </GestureDetector>

      <View style={styles.statsContainer}>
        <Text style={styles.mutualText}>
          {item.username}
        </Text>
      </View>
      {/* <View style={styles.statsContainer}>
        <Text style={styles.mutualText}>
          {item.mutual_friend_count} mutual friends
        </Text>
      </View> */}
      {item.bio ? (
        <View style={styles.statsContainer}>
          <Text style={styles.mutualText}>
            {item.bio}
          </Text>
        </View>
      ) : null}

        {item.overlap_categories ? (
        <View style={styles.categoriesContainer}>
          {item.overlap_categories.map((category, index) => (
            <View key={index} style={styles.categoryTag}>
              <Text style={styles.categoryText}>{category}</Text>
            </View>
          ))}
        </View>
        ) : null}

      <View style={styles.matchContainer}>
        <HorizontalProgress percentage={item.match_rate} />
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  pressableHearts: {
    
  },
  container: {
    flex: 1,
    backgroundColor: Colors.light.mainBackgroundColor,
    paddingVertical: 20,
  },
  fullContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    color: Colors.light.textPurple,
    marginBottom: 16,
    fontFamily: 'Milkyway',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  requestCard: {
    backgroundColor: Colors.light.lightBlue,
    borderRadius: 48,
    padding: 16,
    marginBottom: 16,
    
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,

    // Android shadow
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  username: {
    fontSize: 16,
    fontFamily: 'Milkyway',
    color: Colors.light.whiteText,
    textAlign: "center",
  },
  userInfo: {
    flex: 1,
    alignItems: "center",
  },
  imageContainer: {
    alignItems: "center",
    marginVertical: 12,
  },
  profileImage: {
    width: 160,
    height: 160,
    borderRadius: 100,
    borderWidth: 10,
    borderColor: Colors.light.modalBackgroundColor,
  },
  statsContainer: {
    alignItems: "center",
    marginVertical: 8,
  },
  mutualText: {
    fontSize: 13,
    color: Colors.light.referenceText,
    textAlign: "center",
    fontFamily: 'Milkyway',
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginVertical: 12,
    gap: 6,
  },
  categoryTag: {
    backgroundColor: Colors.light.referenceBack,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.light.iconLight,
  },
  categoryText: {
    fontSize: 11,
    color: Colors.light.textPurple,
    fontFamily: 'Milkyway',
  },
  matchContainer: {
    alignItems: "center",
    marginTop: 12,
  },
  matchLabel: {
    fontSize: 12,
    color: Colors.light.referenceText,
    marginBottom: 8,
    fontFamily: 'Milkyway',
  },
  progressContainer: {
    alignItems: "center",
    width: "100%",
  },
  progressBackground: {
    width: "80%",
    height: 8,
    backgroundColor: Colors.light.iconLight,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.light.gradientPink,
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 12,
    fontWeight: "bold",
    color: Colors.light.textPurple,
    marginTop: 6,
  },
  acceptButton: {
    position: 'relative',
    // backgroundColor: Colors.light.gradientBlue,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 70,
  },
  acceptText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: 'Milkyway',
    textAlign: "center",
  },
  rejectButton: {
    position: 'relative',
    // backgroundColor: Colors.light.darkPink,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 70,
  },
  rejectText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: 'Milkyway',
    textAlign: "center",
  },
  interestedButton: {
    position: 'relative',
    // backgroundColor: Colors.light.gradientPink,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
  },
  interestedText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: 'Milkyway',
    textAlign: "center",
  },
  notInterestedButton: {
    position: 'relative',
    // backgroundColor: Colors.light.iconLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
  },
  notInterestedText: {
    color: Colors.light.whiteText,
    fontSize: 11,
    fontFamily: 'Milkyway',
    textAlign: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    color: Colors.light.referenceText,
    fontSize: 16,
    textAlign: "center",
    fontFamily: 'Milkyway',
  },
});