// index.tsx
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

const API_URL =
  Platform.OS === "android"
    ? process.env.EXPO_PUBLIC_API_URL_ALTERNATIVE
    : process.env.EXPO_PUBLIC_API_URL;

const PlaceholderImage = require("@/assets/images/post-data-01.png");
const PlaceholderProfileImage = require("@/assets/images/broken-image-dark.png");
const PlaceholderReferenceImage = require("@/assets/images/neon-01.jpg");

const categories = [
  "For you", "Art", "Food", "Craft", "Beauty", "Stars", "Counter-Strike 2",
  "PUBG", "Me", "Shen", "Da", "Varskvlavebi", "Mze", "Ca", "Lurji", "Mdelo",
];

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
   Category Modal (fetches by referenceId, unwraps { reference: {...} })
=========================== */
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
                Couldn’t load reference
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
                    source={data.image_url ? { uri: data.image_url } : PlaceholderReferenceImage}
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
}

const testDescription =
  "Beyond the cliffs and crashing waves lies a trail few have dared to follow.";

function PostItem({
  postData,
  isExpanded,
  onToggleExpand,
  onOpenReference,
}: PostItemProps) {
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

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      const x = event.translationX;
      rotation.value = interpolate(x, [-100, 0, 100], [-40, 0, 40]);
      if (x > 30) heartState.value = "red";
      else if (x < -30) heartState.value = "#bcb1d1";
      else heartState.value = "none";
    })
    .onEnd(() => {
      rotation.value = withSpring(0);
      heartState.value = "none";
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: 200 }, { rotateZ: `${rotation.value}deg` }, { translateY: -200 }],
  }));

  return (
    <View style={styles.postCard}>
      {/* First Line */}
      <View style={styles.firstLine}>
        <View style={styles.likeContainer}>
          <View style={styles.iconButton}>
            <MaterialCommunityIcons
              name={
                localHeart === "#bcb1d1" ? "heart-broken" : "heart-broken-outline"
              }
              size={36}
              color={"#bcb1d1"}
            />
          </View>
          <Text style={styles.likeCount}>{post.dislike_count}</Text>
        </View>
        <Text style={styles.usernameText}>{post.category_name}</Text>
        <View style={styles.likeContainer}>
          <View style={styles.iconButton}>
            <MaterialCommunityIcons
              name={
                localHeart === "red" ? "heart" : "heart-outline"
              }
              size={36}
              color={"#bcb1d1"}
            />
          </View>
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
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons 
              name={postData.is_saved ? "bookmark" : "bookmark-outline"} 
              size={30} 
              color={Colors.light.logoPink} 
            />
          </TouchableOpacity>
        </View>

        {/* Fourth Line */}
        <View style={styles.fourthLine}>
          <Image
            // source={{ uri: post.profileImage }}
            source={PlaceholderProfileImage}
            style={styles.profileImage}
            defaultSource={PlaceholderProfileImage}
            onError={(e) =>
              console.log("Image failed to load:", e.nativeEvent.error)
            }
          />
          <View style={styles.fourthLineText}>
            <Text style={{color: Colors.light.bioTextColor, fontFamily: 'Milkyway', fontSize: 24}}>{post.username}</Text>
            <TouchableOpacity onPress={onToggleExpand}>
              <Text
                style={styles.descriptionText}
                numberOfLines={isExpanded ? undefined : 2}
              >
                {post.description}
                {!isExpanded && testDescription.length > 100 && "... more"}
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
            <View style={{display: 'flex', flexDirection: 'row', backgroundColor: Colors.light.textPink, justifyContent: 'center', alignItems: 'center', height: 28, borderRadius: 14, gap: 2, paddingLeft: 4, paddingRight: 4,}}>
              <Text style={{fontFamily: 'Milkyway', color: Colors.light.textPink, backgroundColor: Colors.light.cardBackgroundColor, width: 12, height: 12, borderRadius: 20, textAlign: 'center', fontSize: 12}}>
                R
              </Text>
              <Text style={{fontFamily: 'Milkyway', color: Colors.light.whiteText}}>
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
  const [selectedCategory, setSelectedCategory] = useState<string>("");

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

      const response = await fetch(`${API_URL}/creator_feed`, {
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

  const handleCategoryPress = (category: string) => {
    setSelectedCategory(category);
  };

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
                  <TouchableOpacity onPress={() => handleCategoryPress(category)}>
                    <Text style={styles.categoryUpText}>{category}</Text>
                  </TouchableOpacity>
                  {index !== categories.length - 1 && (
                    <View style={styles.separator} />
                  )}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

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
              onOpenReference={handleOpenReference}
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
    // padding: 15,
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
    fontFamily: 'Milkyway'
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