import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
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
const PlaceholderReferenceImage = require("@/assets/images/neon-01.jpg");

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
  reference_title: string;
  reference_id: string;
  category_tag_names: string[];
  hashtag_names: string[];
  profile_pic?: string | null;
}

interface PostData {
  post: Post;
  is_saved: boolean;
  reaction: "like" | "dislike" | "none";  // Changed from null to "none"
}

interface ApiResponse {
  feed_posts: PostData[];  // Changed from 'posts' to 'feed_posts'
}

/* ===== Reference modal types ===== */
type Reference = {
  id: string;
  category_id: string;
  title: string;
  description?: string | null;
  image_url?: string | null;
  tags?: string[] | null;
  attributes?: Record<string, unknown> | null;
};
type ReferenceEnvelope = { reference: Reference };

/* ===== /me response ===== */
type MeResponse = {
  user: {
    id: string;
    mail: string;
    username: string;
    display_name: string;
    bio: string | null;
    profile_pic: string | null;
  };
};

/* ===========================
   Category Modal
=========================== */
interface CategoryModalProps {
  visible: boolean;
  onClose: () => void;
  referenceId: string | null;
  categoryName?: string;
  token: string | null;
}

function CategoryModal({
  visible,
  onClose,
  referenceId,
  categoryName,
  token,
}: CategoryModalProps) {
  const [data, setData] = useState<Reference | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const tags = useMemo(() => data?.tags ?? [], [data]);
  const attributesList = useMemo(() => {
    const attrs = data?.attributes ?? null;
    if (!attrs) return [];
    return Object.entries(attrs).map(([k, v]) => [
      k,
      typeof v === "string" ? v : JSON.stringify(v),
    ]);
  }, [data]);

  useEffect(() => {
    let abort = new AbortController();

    async function fetchReference() {
      if (!visible || !referenceId) return;
      setLoading(true);
      setErr(null);
      setData(null);

      try {
        const headers: Record<string, string> = { Accept: "application/json" };
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(
          `${API_URL}/reference/references/${referenceId}`,
          { method: "GET", headers, signal: abort.signal }
        );

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`Failed (${res.status}): ${text || res.statusText}`);
        }

        const json = (await res.json()) as ReferenceEnvelope;
        setData(json.reference);
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          setErr(e?.message || "Failed to load reference");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchReference();
    return () => abort.abort();
  }, [visible, referenceId, token]);

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.6)",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 560,
            backgroundColor: Colors.light.cardBackgroundColor,
            borderRadius: 16,
            padding: 16,
          }}
        >
          <View style={{ alignItems: "flex-end" }}>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={36} color={Colors.light.logoPink} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={{ paddingVertical: 32, alignItems: "center" }}>
              <ActivityIndicator />
              <Text style={{ marginTop: 12, color: Colors.light.whiteText }}>
                Loading reference…
              </Text>
            </View>
          ) : err ? (
            <View style={{ paddingVertical: 16 }}>
              <Text style={{ color: "red", fontWeight: "700", marginBottom: 8 }}>
                Couldn't load reference
              </Text>
              <Text style={{ opacity: 0.8, color: Colors.light.whiteText }}>{err}</Text>
            </View>
          ) : data ? (
            <>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: Colors.light.textPink,
                  marginBottom: 6,
                }}
              >
                {categoryName || data.category_id || "Reference"}
              </Text>

              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "800",
                  color: Colors.light.whiteText,
                  marginBottom: 12,
                }}
              >
                {data.title || "Untitled"}
              </Text>

              <View>
                <View style={{ alignItems: "center", marginBottom: 12 }}>
                  <Image
                    source={
                      data.image_url ? { uri: data.image_url } : PlaceholderReferenceImage
                    }
                    style={{ width: 280, height: 180, borderRadius: 12 }}
                    defaultSource={PlaceholderReferenceImage}
                  />
                </View>

                {!!data.description && (
                  <View style={{ marginBottom: 8 }}>
                    <Text style={{ fontWeight: "700", color: Colors.light.whiteText }}>
                      Description:
                    </Text>
                    <Text style={{ color: Colors.light.bioTextColor }}>{data.description}</Text>
                  </View>
                )}

                {attributesList.length > 0 && (
                  <View style={{ marginBottom: 8 }}>
                    <Text style={{ fontWeight: "700", color: Colors.light.whiteText }}>
                      Attributes:
                    </Text>
                    <View style={{ marginTop: 6 }}>
                      {attributesList.map(([k, v]) => (
                        <View key={String(k)} style={{ flexDirection: "row", marginBottom: 4 }}>
                          <Text
                            style={{
                              width: 120,
                              color: Colors.light.textPink,
                              fontWeight: "600",
                            }}
                          >
                            {k}:
                          </Text>
                          <Text style={{ color: Colors.light.bioTextColor }}>{String(v)}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {tags.length > 0 && (
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                    {tags.map((tag, i) => (
                      <View
                        key={`${tag}-${i}`}
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          borderRadius: 14,
                          backgroundColor: Colors.light.textPink,
                        }}
                      >
                        <Text style={{ color: Colors.light.whiteText }}>#{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </>
          ) : (
            <View style={{ paddingVertical: 16 }}>
              <Text style={{ color: Colors.light.whiteText }}>No reference selected.</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

/* ===========================
   Single Post Item
=========================== */
interface PostItemProps {
  postData: PostData;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onOpenReference: (referenceId: string, categoryName: string) => void;
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
  onOpenReference,
  onToggleSave,
  onToggleReaction,
}: PostItemProps) {
  const post = postData.post;
  const imageUrl = post.media[0]?.url || null;
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
        runOnJS(onToggleReaction)(post.id, postData.reaction, "like");
      } else if (x < -30) {
        runOnJS(onToggleReaction)(post.id, postData.reaction, "dislike");
      }

      rotation.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: 200 },
      { rotateZ: `${rotation.value}deg` },
      { translateY: -200 },
    ],
  }));

  const renderMainImage = () => {
    // Remote image requires { uri }; defaultSource must be static.
    if (imageUrl) {
      return (
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          defaultSource={PlaceholderImage}
          onError={(e) => console.log("Image failed to load:", e.nativeEvent.error)}
        />
      );
    }
    return <Image source={PlaceholderImage} style={styles.image} />;
  };

  const renderProfileImage = () => {
    if (post.profile_pic) {
      return (
        <Image
          source={{ uri: post.profile_pic }}
          style={styles.profileImage}
          defaultSource={PlaceholderProfileImage}
          onError={(e) => console.log("Profile image failed:", e.nativeEvent.error)}
        />
      );
    }
    return (
      <Ionicons name="person-circle-outline" size={90} color={Colors.light.bioTextColor} />
    );
  };

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
        <Text style={styles.usernameText}>{post.category_name}</Text>
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
          {renderMainImage()}
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
          {renderProfileImage()}
          <View style={styles.fourthLineText}>
            <Text style={{ color: Colors.light.bioTextColor, fontFamily: "Milkyway", fontSize: 24 }}>
              {post.username}
            </Text>
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
        {post.reference_title ? (
          <TouchableOpacity
            onPress={() => post.reference_id && onOpenReference(post.reference_id, post.category_name)}
          >
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                backgroundColor: Colors.light.textPink,
                justifyContent: "center",
                alignItems: "center",
                height: 28,
                borderRadius: 14,
                gap: 2,
                paddingLeft: 4,
                paddingRight: 4,
              }}
            >
              <Text
                style={{
                  fontFamily: "Milkyway",
                  color: Colors.light.textPink,
                  backgroundColor: Colors.light.cardBackgroundColor,
                  width: 12,
                  height: 12,
                  borderRadius: 20,
                  textAlign: "center",
                  fontSize: 12,
                }}
              >
                R
              </Text>
              <Text style={{ fontFamily: "Milkyway", color: Colors.light.whiteText }}>
                {post.reference_title}
              </Text>
            </View>
          </TouchableOpacity>
        ) : null}

        {post.category_tag_names.map((name, i) => (
          <Text key={`ct-${i}`} style={styles.hashtag}>
            #{name}
          </Text>
        ))}
        {post.hashtag_names.map((name, i) => (
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

  const LIMIT = 15; // you can tweak this

  const getToken = async (): Promise<string | null> => {
    try {
      const value = await AsyncStorage.getItem("auth-key");
      if (value) {
        const parsed = JSON.parse(value);
        return parsed.token ?? null;
      }
    } catch (error) {
      console.error("Error getting token from storage:", error);
    }
    return null;
  };

  async function fetchMe(t: string): Promise<string> {
    const res = await fetch(`${API_URL}/me`, {
      headers: { Accept: "application/json", Authorization: `Bearer ${t}` },
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`/me failed (${res.status}): ${txt || res.statusText}`);
    }
    const json = (await res.json()) as MeResponse;
    if (!json?.user?.id) throw new Error("Missing user id in /me");
    return json.user.id;
  }

  async function fetchCreatorPostsFor(userId: string, t: string): Promise<ApiResponse> {
    const url = `${API_URL}/users/${userId}/creator_posts?limit=${LIMIT}`;
    const res = await fetch(url, {
      headers: { Accept: "application/json", Authorization: `Bearer ${t}` },
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`/users/{id}/creator_posts failed (${res.status}): ${txt || res.statusText}`);
    }
    return (await res.json()) as ApiResponse;
  }

  const fetchCreatorFeed = async (isRefresh: boolean = false) => {
  if (isRefresh) setRefreshing(true);
  else setLoading(true);

  try {
    const t = await getToken();
    if (!t) throw new Error("Token not found");
    setToken(t);

    // 1) Who am I?
    const myId = await fetchMe(t);

    // 2) Get creator posts for me
    const data = await fetchCreatorPostsFor(myId, t);
    
    // Convert "none" to null for consistency with your existing logic
    const normalizedPosts = data.feed_posts.map(postData => ({
      ...postData,
      reaction: postData.reaction === "none" ? null : postData.reaction
    }));
    
    setPosts(normalizedPosts);
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

  const handleOpenReference = (referenceId: string, categoryName: string) => {
    setSelectedReferenceId(referenceId);
    setSelectedCategoryName(categoryName || "");
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedReferenceId(null);
    setSelectedCategoryName("");
  };

  // Toggle Save Post
  const toggleSavePost = async (postId: string, isSaved: boolean) => {
    if (!token) return;

    try {
      const method = isSaved ? "DELETE" : "POST";
      const response = await fetch(`${API_URL}/creator-posts/${postId}/save`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const txt = await response.text().catch(() => "");
        throw new Error(`toggle save failed (${response.status}): ${txt || response.statusText}`);
      }

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
  const toggleReaction = async (
  postId: string,
  currentReaction: "like" | "dislike" | null,
  newReaction: "like" | "dislike"
) => {
  if (!token) return;

  try {
    let endpoint = "";
    let method = "POST";

    if (currentReaction === newReaction) {
      endpoint = `${API_URL}/creator-posts/${postId}/unlike`;
    } else {
      endpoint = `${API_URL}/creator-posts/${postId}/${newReaction}`;
    }

    const response = await fetch(endpoint, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const txt = await response.text().catch(() => "");
      throw new Error(`reaction failed (${response.status}): ${txt || response.statusText}`);
    }

    // optimistic UI update
    setPosts((prevPosts) =>
      prevPosts.map((p) => {
        if (p.post.id !== postId) return p;

        let likeCount = p.post.like_count;
        let dislikeCount = p.post.dislike_count;
        let reaction: "like" | "dislike" | null = p.reaction;

        if (currentReaction === newReaction) {
          // undo
          if (newReaction === "like") likeCount = Math.max(0, likeCount - 1);
          if (newReaction === "dislike") dislikeCount = Math.max(0, dislikeCount - 1);
          reaction = null;
        } else {
          // switch reaction
          if (newReaction === "like") {
            likeCount += 1;
            if (currentReaction === "dislike") dislikeCount = Math.max(0, dislikeCount - 1);
          }
          if (newReaction === "dislike") {
            dislikeCount += 1;
            if (currentReaction === "like") likeCount = Math.max(0, likeCount - 1);
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
          backgroundColor: Colors.light.mainBackgroundColor,
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}
      >
        <ActivityIndicator size="large" color={Colors.light.gradientPink} />
        <Text style={{ marginTop: 10, color: Colors.light.whiteText }}>
          Loading posts...
        </Text>
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
              onOpenReference={handleOpenReference}
              onToggleSave={toggleSavePost}
              onToggleReaction={(id, currentReaction, newReaction) =>
                toggleReaction(id, currentReaction, newReaction)
              }
            />
          ))
        )}
      </ScrollView>

      <CategoryModal
        visible={modalVisible}
        onClose={closeModal}
        referenceId={selectedReferenceId}
        categoryName={selectedCategoryName}
        token={token}
      />
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
    fontFamily: "Milkyway",
    backgroundColor: Colors.light.logoPink,
    width: 175,
    height: 25,
    borderRadius: 20,
    textAlign: "center",
    paddingTop: 2,
  },
  categoryUpText: {
    color: Colors.light.inputText,
    fontSize: 16,
    fontWeight: "500",
    paddingHorizontal: 13,
    paddingTop: 3,
    fontFamily: "Milkyway",
  },
  postCard: {
    marginBottom: 24,
    borderRadius: 32,
    backgroundColor: Colors.light.cardBackgroundColor,
    display: "flex",
    gap: 12,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,

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
    objectFit: "fill",
  },
  imageBelowFirstLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#6A4C93",
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
    position: "relative",
  },
  fourthLine: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
    paddingLeft: 16,
  },
  fourthLineText: {
    display: "flex",
    flexDirection: "column",
  },
  iconGroup: {
    flexDirection: "row",
    gap: 16,
    position: "absolute",
    right: 10,
    top: -10,
  },
  iconButton: {
    paddingHorizontal: 1,
    paddingVertical: 4,
  },
  likeContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  likeCount: {
    fontFamily: "Milkyway",
    color: Colors.light.bioTextColor,
  },
  descriptionText: {
    marginTop: 8,
    color: Colors.light.bioTextColor,
    fontSize: 12,
    lineHeight: 20,
    fontFamily: "Milkyway",
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
    fontFamily: "Milkyway",
  },
  reactionHashtag: {
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  loadingText: {
    marginTop: 10,
    color: Colors.light.textPurple,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    color: "#fff",
    fontSize: 16,
    fontFamily: 'Milkyway',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxHeight: "80%",
  },
  modalCard: {
    borderRadius: 20,
    padding: 20,
    position: "relative",
    backgroundColor: Colors.light.modalBackgroundColor,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,

    elevation: 3,
  },
  closeButton: {
    position: "absolute",
    top: 15,
    right: 15,
    width: 42,
    height: 42,
    borderRadius: 40,
    backgroundColor: Colors.light.cardBackgroundColor,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,

    elevation: 3,
  },
  modalCategoryTitle: {
    color: Colors.light.whiteText,
    fontSize: 18,
    marginBottom: 15,
    fontFamily: "Milkyway",
    backgroundColor: Colors.light.logoPink,
    maxWidth: 175,
    textAlign: "center",
    borderRadius: 20,
  },
  modalImageContainer: {
    width: "100%",
    height: 400,
    borderRadius: 36,
    overflow: "hidden",
    marginBottom: 15,
  },
  modalImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 24,
    marginBottom: 10,
    fontFamily: "Milkyway",
  },
  detailsContainer: {
    marginBottom: 20,
    backgroundColor: Colors.light.cardBackgroundColor,
    borderRadius: 36,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,

    elevation: 3,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "flex-start",
    paddingLeft: 6,
    paddingRight: 6,
  },
  detailLabel: {
    color: Colors.light.bioTextColor,
    fontSize: 14,
    width: 80,
    fontFamily: "Milkyway",
  },
  detailValue: {
    color: Colors.light.logoPink,
    fontSize: 14,
    flex: 1,
    fontFamily: "Milkyway",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
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
    fontFamily: "Milkyway",
  },
});
