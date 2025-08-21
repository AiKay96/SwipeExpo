import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from "react-native-gesture-handler";
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const API_URL =
  Platform.OS === "android"
    ? process.env.EXPO_PUBLIC_API_URL_ALTERNATIVE
    : process.env.EXPO_PUBLIC_API_URL;

const PlaceholderImage = require("@/assets/images/background-image.png");
const PlaceholderProfileImage = require("@/assets/images/react-logo.png");

const categories = [
  "For you", "Movies", "Crochet", "Moto", "Games", "Dota 2", "Counter-Strike 2",
  "PUBG", "Me", "Shen", "Da", "Varskvlavebi", "Mze", "Ca", "Lurji", "Mdelo",
];

type HeartColor = "none" | "red" | "#fdebf1";

interface MediaItem {
  url: string;
  media_type: string;
}

interface Post {
  id: string;
  user_id: string;
  description: string;
  privacy: string;
  like_count: number;
  dislike_count: number;
  created_at: string;
  media: MediaItem[];
}

interface PostData {
  post: Post;
  is_saved: boolean;
  reaction: "like" | "dislike" | null;
}

interface ApiResponse {
  posts: PostData[];
}

// Separate component for each post to handle hooks properly
interface PostItemProps {
  postData: PostData;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

function PostItem({ postData, isExpanded, onToggleExpand }: PostItemProps) {
  const post = postData.post;
  const imageUrl = post.media[0]?.url;

  const rotation = useSharedValue(0);
  const heartState = useSharedValue<HeartColor>("none");
  const [localHeart, setLocalHeart] = useState<HeartColor>("none");

  useAnimatedReaction(
    () => heartState.value,
    (value) => {
      runOnJS(setLocalHeart)(value);
    }
  );

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onStart: (_, ctx: any) => {
      ctx.startX = 0;
    },
    onActive: (event, ctx: any) => {
      const x = event.translationX;
      rotation.value = interpolate(x, [-100, 0, 100], [-40, 0, 40]);

      if (x > 30) {
        heartState.value = "red";
      } else if (x < -30) {
        heartState.value = "#fdebf1";
      } else {
        heartState.value = "none";
      }
    },
    onEnd: () => {
      rotation.value = withSpring(0);
      heartState.value = "none";
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: 200 }, // move pivot point to bottom
        { rotateZ: `${rotation.value}deg` },
        { translateY: -200 }, // move back
      ],
    };
  });

  return (
    <LinearGradient 
      style={styles.postCard} 
      colors={[Colors.light.gradientMid, Colors.light.gradientBlue]} 
      start={{ x: 1, y: 1 }} 
      end={{ x: 0, y: 0 }}
    >
      {/* First Line */}
      <View style={styles.firstLine}>
        <View style={styles.iconButton}>
          <MaterialCommunityIcons
            name={
              localHeart === "#fdebf1" ? "heart-broken" : "heart-broken-outline"
            }
            size={28}
            color={"#fdebf1"}
          />
        </View>
        <Text style={styles.usernameText}>@{post.user_id.slice(0, 8)}</Text>
        <View style={styles.iconButton}>
          <MaterialCommunityIcons
            name={
              localHeart === "red" ? "heart" : "heart-outline"
            }
            size={28}
            color={"#fdebf1"}
          />
        </View>
      </View>

      {/* Second Line - Image */}
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.image, animatedStyle]}>
          <Image
            source={imageUrl ? imageUrl : PlaceholderImage}
            style={StyleSheet.absoluteFill}
            defaultSource={PlaceholderImage}
            onError={(e) =>
              console.log("Image failed to load:", e.nativeEvent.error)
            }
          />
        </Animated.View>
      </PanGestureHandler>

      {/* Third Line */}
      <View style={styles.metaRow}>
        <LinearGradient
          colors={[Colors.light.gradientPink, Colors.light.gradientMid, Colors.light.gradientBlue]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.imageBelowFirstLine}
        >
          <Text style={styles.categoryText}>
            {post.like_count} likes • {post.dislike_count} dislikes
          </Text>
        </LinearGradient>
        <View style={styles.iconGroup}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons 
              name="chatbubble-outline" 
              size={22} 
              color={Colors.light.gradientPurpleDark} 
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons 
              name={postData.is_saved ? "bookmark" : "bookmark-outline"} 
              size={22} 
              color={Colors.light.gradientBlueDark} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Fourth Line - Description */}
      <TouchableOpacity onPress={onToggleExpand}>
        <Text
          style={styles.descriptionText}
          numberOfLines={isExpanded ? undefined : 2}
        >
          {post.description}
          {!isExpanded && post.description.length > 100 && "... more"}
        </Text>
      </TouchableOpacity>

      {/* Fifth Line - Date */}
      <View style={styles.hashtagRow}>
        <Text style={styles.hashtag}>
          {new Date(post.created_at).toLocaleDateString()}
        </Text>
        <Text style={styles.hashtag}>
          {post.privacy}
        </Text>
        {postData.reaction && (
          <Text style={[styles.hashtag, { backgroundColor: postData.reaction === 'like' ? '#e8f5e8' : '#fde8e8' }]}>
            {postData.reaction}
          </Text>
        )}
      </View>
    </LinearGradient>
  );
}

export default function CreatorScreen() {
  const colorScheme = useColorScheme();
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const fetchCreatorFeed = async (isRefresh: boolean = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const token = await getToken();
      if (!token) throw new Error("Token not found");

      const response = await fetch(`${API_URL}/creator_feed`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch creator feed");
      }

      const data: ApiResponse = await response.json();
      setPosts(data.posts);
    } catch (error) {
      console.error("Error fetching creator feed:", error);
      Alert.alert("Error", "Failed to load posts. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCreatorFeed();
  }, []);

  const handleRefresh = () => {
    fetchCreatorFeed(true);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.light.gradientPink} />
        <Text style={styles.loadingText}>Loading posts...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.scrollView} 
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Top Categories | Horizontal Scroll */}
      <View style={{ height: 30, marginVertical: 10 }}>
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          <View style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
            {categories.map((category, index) => (
              <View key={index} style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                <Text style={styles.categoryUpText}>{category}</Text>
                {index !== categories.length - 1 && (
                  <View style={styles.separator} />
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Posts Feed | Vertical Scroll */}
      {posts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No posts available</Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        posts.map((postData) => (
          <PostItem
            key={postData.post.id}
            postData={postData}
            isExpanded={expandedPostId === postData.post.id}
            onToggleExpand={() => 
              setExpandedPostId(
                expandedPostId === postData.post.id ? null : postData.post.id
              )
            }
          />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: "#fff",
  },
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  categoriesContainer: {
    alignItems: "center",
  },
  separator: {
    width: 2,
    height: 20,
    backgroundColor: Colors.light.iconLight,
    opacity: 0.7,
  },
  usernameText: {
    color: Colors.light.pink,
    fontSize: 16,
    fontWeight: "500",
    paddingBottom: 2,
  },
  categoryUpText: {
    color: Colors.light.textPurple,
    fontSize: 16,
    fontWeight: "500",
    paddingHorizontal: 13,
    paddingBottom: 1.5,
  },
  postCard: {
    marginBottom: 24,
    borderRadius: 32,
    padding: 12,
  },
  firstLine: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: 400,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#222", // fallback
  },
  imageBelowFirstLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 10,
    overflow: "hidden",
  },
  categoryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  profileImage: {
    width: 28,
    height: 28,
    borderRadius: 40,
    overflow: "hidden",
  },
  metaRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconGroup: {
    flexDirection: "row",
    gap: 16,
  },
  iconButton: {
    paddingHorizontal: 1,
    paddingVertical: 4,
  },
  descriptionText: {
    marginTop: 8,
    color: Colors.light.descriptionPink,
    fontSize: 14,
    lineHeight: 20,
  },
  hashtagRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  hashtag: {
    color: Colors.light.referenceText,
    fontSize: 13,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: Colors.light.referenceBack,
    borderRadius: 10,
  },
  loadingText: {
    marginTop: 10,
    color: Colors.light.textPurple,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    color: Colors.light.textPurple,
    fontSize: 18,
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: Colors.light.gradientBlue,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});