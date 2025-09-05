import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";

import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useRouter } from "expo-router";

const API_URL =
  Platform.OS === "android"
    ? process.env.EXPO_PUBLIC_API_URL_ALTERNATIVE
    : process.env.EXPO_PUBLIC_API_URL;

const PlaceholderImage = require("@/assets/images/post-data-01.png");
const PlaceholderProfileImage = require("@/assets/images/broken-image-dark.png");

type HeartColor = "none" | "red" | "#bcb1d1";

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
  category_name: string;
  username: string;
  category_tag_names?: string[];
  hashtag_names?: string[];
  profile_pic?: string | null;
}

interface PostData {
  post: Post;
  is_saved: boolean;
  reaction: "like" | "dislike" | null;
}

interface ApiResponse {
  posts: PostData[];
}

/* ===========================
   Single Post Item
=========================== */
interface PostItemProps {
  postData: PostData;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleSave: (postId: string, isSaved: boolean) => void;
  onToggleReaction: (
    postId: string,
    currentReaction: "like" | "dislike" | null,
    newReaction: "like" | "dislike"
  ) => void;
}

function PostItem({
  postData,
  isExpanded,
  onToggleExpand,
  onToggleSave,
  onToggleReaction,
}: PostItemProps) {
  const post = postData.post;
  const imageUrl = post.media[0]?.url;
  const router = useRouter();
  
  const rotation = useSharedValue(0);
  const heartState = useSharedValue<HeartColor>("none");
  const [localHeart, setLocalHeart] = useState<HeartColor>("none");

  useAnimatedReaction(
    () => heartState.value,
    (value) => {
      runOnJS(setLocalHeart)(value);
    }
  );

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      const x = event.translationX;
      rotation.value = interpolate(x, [-100, 0, 100], [-40, 0, 40]);
    })
    .onEnd((event) => {
      const x = event.translationX;

      if (x > 30) {
        // ✅ swipe right → like
        runOnJS(onToggleReaction)(post.id, postData.reaction, "like");
      } else if (x < -30) {
        // ✅ swipe left → dislike
        runOnJS(onToggleReaction)(post.id, postData.reaction, "dislike");
      }

      // reset rotation smoothly
      rotation.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: 200 },
      { rotateZ: `${rotation.value}deg` },
      { translateY: -200 },
    ],
  }));

  return (
    <View style={styles.postCard}>
      {/* First Line */}
      <View style={styles.firstLine}>
        <View style={styles.likeContainer}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => onToggleReaction(post.id, postData.reaction, "dislike")}
          >
            <MaterialCommunityIcons
              name={postData.reaction === "dislike" ? "heart-broken" : "heart-broken-outline"}
              size={36}
              color={"#bcb1d1"}
            />
          </TouchableOpacity>
          <Text style={styles.likeCount}>{post.dislike_count}</Text>
        </View>
        {/* <Text style={styles.usernameText}>{post.category_name}</Text> */}
        <View style={styles.likeContainer}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => onToggleReaction(post.id, postData.reaction, "like")}
          >
            <MaterialCommunityIcons
              name={postData.reaction === "like" ? "heart" : "heart-outline"}
              size={36}
              color={"#bcb1d1"}
            />
          </TouchableOpacity>
          <Text style={styles.likeCount}>{post.like_count}</Text>
        </View>
      </View>

      {/* Second Line - Image */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.image, animatedStyle]}>
          <Image
            source={imageUrl ? imageUrl : PlaceholderImage}
            // source={PlaceholderImage}
            // style={StyleSheet.absoluteFill}
            style={styles.image}
            defaultSource={imageUrl ? imageUrl : PlaceholderImage}
            onError={(e) =>
              console.log("Image failed to load:", e.nativeEvent.error)
            }
          />
        </Animated.View>
      </GestureDetector>

      {/* Third Line */}
      <View style={styles.metaRow}>
        <View style={styles.iconGroup}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons 
              name="chatbubble-outline" 
              size={30} 
              color={Colors.light.logoPink} 
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => onToggleSave(post.id, postData.is_saved)}
          >
            <Ionicons 
              name={postData.is_saved ? "bookmark" : "bookmark-outline"} 
              size={30} 
              color={Colors.light.logoPink} 
            />
          </TouchableOpacity>
        </View>

        {/* Fourth Line */}
        <View style={styles.fourthLine}>
          <TouchableOpacity onPress={() => router.push(`/user/${post.username}`)}>
            {post.profile_pic? (
              <Image
                source={post.profile_pic ? post.profile_pic : PlaceholderProfileImage}
                style={styles.profileImage}
                defaultSource={post.profile_pic ? post.profile_pic : PlaceholderProfileImage}
                onError={(e) =>
                  console.log("Image failed to load:", e.nativeEvent.error)
                }
              />
            ) : (
              <Ionicons name="person-circle-outline" size={90} color={Colors.light.bioTextColor} />
            )}
          </TouchableOpacity>
          <View style={styles.fourthLineText}>
            <Text style={{color: Colors.light.bioTextColor, fontFamily: 'Milkyway', fontSize: 24}}>{post.username}</Text>
            <TouchableOpacity onPress={onToggleExpand}>
              <Text
                style={styles.descriptionText}
                numberOfLines={isExpanded ? undefined : 2}
              >
                {post.description}
                {!isExpanded && post.description.length > 100 && "... more"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Fifth Line */}
      <View style={styles.hashtagRow}>
        {post.category_tag_names?.map((name, i) => (
          <Text key={`ct-${i}`} style={styles.hashtag}>
            #{name}
          </Text>
        ))}
        {post.hashtag_names?.map((name, i) => (
          <Text key={`ht-${i}`} style={styles.hashtag}>
            #{name}
          </Text>
        ))}
      </View>
    </View>
  );
}

/* ===========================
   Screen
=========================== */
export default function CreatorScreen() {
  const colorScheme = useColorScheme();
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReferenceId, setSelectedReferenceId] = useState<string | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>("");
  const [token, setToken] = useState<string | null>(null);

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
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const t = await getToken();
      if (!t) throw new Error("Token not found");
      setToken(t);

      const response = await fetch(`${API_URL}/personal-feed`, {
        headers: { Authorization: `Bearer ${t}` },
      });

      if (!response.ok) throw new Error("Failed to fetch creator feed");
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

  const handleRefresh = () => fetchCreatorFeed(true);

  // Toggle Save Post
  const toggleSavePost = async (postId: string, isSaved: boolean) => {
    if (!token) return;

    try {
      const method = isSaved ? "DELETE" : "POST";
      const response = await fetch(`${API_URL}/posts/${postId}/save`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to toggle save");
      }

      // Update state locally
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.post.id === postId ? { ...p, is_saved: !isSaved } : p
        )
      );
    } catch (error) {
      console.error("Error toggling save:", error);
      Alert.alert("Error", "Failed to update save status. Please try again.");
    }
  };

  // Toggle Reaction (Like / Unlike / Dislike)
  const toggleReaction = async (postId: string, currentReaction: "like" | "dislike" | null, newReaction: "like" | "dislike") => {
    if (!token) return;

    try {
      let endpoint = "";
      let method = "POST";

      if (currentReaction === newReaction) {
        // same reaction tapped again -> unlike
        endpoint = `${API_URL}/posts/${postId}/unlike`;
      } else {
        // different reaction or null -> new reaction
        endpoint = `${API_URL}/posts/${postId}/${newReaction}`;
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to update reaction");

      // Update UI optimistically
      setPosts((prevPosts) =>
        prevPosts.map((p) => {
          if (p.post.id !== postId) return p;

          let likeCount = p.post.like_count;
          let dislikeCount = p.post.dislike_count;
          let reaction: "like" | "dislike" | null = p.reaction;

          if (currentReaction === newReaction) {
            // undo
            if (newReaction === "like") likeCount--;
            if (newReaction === "dislike") dislikeCount--;
            reaction = null;
          } else {
            // switch reaction
            if (newReaction === "like") {
              likeCount++;
              if (currentReaction === "dislike") dislikeCount--;
            }
            if (newReaction === "dislike") {
              dislikeCount++;
              if (currentReaction === "like") likeCount--;
            }
            reaction = newReaction;
          }

          return {
            ...p,
            reaction,
            post: {
              ...p.post,
              like_count: likeCount,
              dislike_count: dislikeCount,
            },
          };
        })
      );
    } catch (error) {
      console.error("Error toggling reaction:", error);
      Alert.alert("Error", "Failed to update reaction. Please try again.");
    }
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.light.background,
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}
      >
        <ActivityIndicator size="large" color={Colors.light.gradientPink} />
        <Text style={{ marginTop: 10, color: Colors.light.whiteText }}>Loading posts...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {posts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No posts available</Text>
            <TouchableOpacity
              onPress={handleRefresh} style={styles.refreshButton}
            >
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
              onToggleSave={toggleSavePost}
              onToggleReaction={(id, currentReaction, newReaction) =>
                toggleReaction(id, currentReaction, newReaction)
              }
            />
          ))
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.light.mainBackgroundColor,
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
    color: Colors.light.whiteText,
    fontSize: 18,
    fontFamily: 'Milkyway',
    backgroundColor: Colors.light.logoPink,
    width: 175,
    height: 25,
    borderRadius: 20,
    textAlign: 'center',
    paddingTop: 2,
  },
  categoryUpText: {
    color: Colors.light.inputText,
    fontSize: 16,
    fontWeight: "500",
    paddingHorizontal: 13,
    paddingTop: 3,
    fontFamily: 'Milkyway',
  },
  postCard: {
    marginBottom: 24,
    borderRadius: 32,
    backgroundColor: Colors.light.cardBackgroundColor,
    display: 'flex',
    gap: 12,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,

    // Android shadow
    elevation: 3,
  },
  firstLine: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: 16,
  },
  image: {
    width: "100%",
    height: 400,
    borderRadius: 50,
    overflow: "hidden",
    backgroundColor: "#222",
    objectFit: 'fill',
  },
  imageBelowFirstLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: '#6A4C93',
  },
  categoryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 100,
  },
  metaRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: 'relative',
  },
  fourthLine: {
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
    paddingLeft: 16,
  },
  fourthLineText: {
    display: 'flex',
    flexDirection: 'column',
  },
  iconGroup: {
    flexDirection: "row",
    gap: 16,
    position: 'absolute',
    right: 10,
    top: -10,
  },
  iconButton: {
    paddingHorizontal: 1,
    paddingVertical: 4,
  },
  likeContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  likeCount: {
    fontFamily: 'Milkyway',
    color: Colors.light.bioTextColor,
  },
  descriptionText: {
    marginTop: 8,
    color: Colors.light.bioTextColor,
    fontSize: 12,
    lineHeight: 20,
    fontFamily: 'Milkyway',
    maxWidth: 226,
  },
  hashtagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingBottom: 16,
    paddingLeft: 10,
    paddingRight: 10,
  },
  hashtag: {
    color: Colors.light.textPink,
    fontSize: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: Colors.light.mainBackgroundColor,
    borderRadius: 10,
    fontFamily: 'Milkyway',
  },
  reactionHashtag: {
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
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
    fontFamily: 'Milkyway',
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
    fontFamily: 'Milkyway',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
  },
  modalCard: {
    borderRadius: 20,
    padding: 20,
    position: 'relative',
    backgroundColor: Colors.light.modalBackgroundColor,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,

    // Android shadow
    elevation: 3,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 42,
    height: 42,
    borderRadius: 40,
    backgroundColor: Colors.light.cardBackgroundColor,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,

    // Android shadow
    elevation: 3,
  },
  modalCategoryTitle: {
    color: Colors.light.whiteText,
    fontSize: 18,
    marginBottom: 15,
    fontFamily: 'Milkyway',
    backgroundColor: Colors.light.logoPink,
    maxWidth: 175,
    textAlign: 'center',
    borderRadius: 20,
  },
  modalImageContainer: {
    width: '100%',
    height: 400,
    borderRadius: 36,
    overflow: 'hidden',
    marginBottom: 15,
  },
  modalImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 10,
    fontFamily: 'Milkyway',
  },
  detailsContainer: {
    marginBottom: 20,
    backgroundColor: Colors.light.cardBackgroundColor,
    borderRadius: 36,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,

    // Android shadow
    elevation: 3,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
    paddingLeft: 6,
    paddingRight: 6,
  },
  detailLabel: {
    color: Colors.light.bioTextColor,
    fontSize: 14,
    width: 80,
    fontFamily: 'Milkyway',
  },
  detailValue: {
    color: Colors.light.logoPink,
    fontSize: 14,
    flex: 1,
    fontFamily: 'Milkyway',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingLeft: 18,
    paddingTop: 8,
    paddingBottom: 10,
  },
  tag: {
    backgroundColor: Colors.light.textPink,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 15,
  },
  tagText: {
    color: Colors.light.whiteText,
    fontSize: 12,
    fontFamily: 'Milkyway',
  },
});