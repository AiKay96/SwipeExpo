import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
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

const PlaceholderImage = require("@/assets/images/post-data-01.png");
const PlaceholderProfileImage = require("@/assets/images/broken-image-dark.png");
const PlaceholderReferenceImage = require("@/assets/images/neon-01.jpg");

const categories = [
  "For you", "Art", "Food", "Craft", "Beauty", "Stars", "Counter-Strike 2",
  "PUBG", "Me", "Shen", "Da", "Varskvlavebi", "Mze", "Ca", "Lurji", "Mdelo",
];

const categoryData = {
  title: "Neon Genesis Evangelion",
  description: "Teen pilots battle angels with giant mechs, facing trauma and existential crises in a landmark anime.",
  image_url: PlaceholderReferenceImage,
  tags: "Anime, Cyberpunk, Alien Invesion",
  creator: "Hideaki Anno",
  actors: "Megumi Ogata, Megumi Hayashibara, Yuko Miyamura",
  duration: "25 min",
  seasons: "1",
  category: 'Animation',
};

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
}

interface PostData {
  post: Post;
  is_saved: boolean;
  reaction: "like" | "dislike" | null;
}

interface ApiResponse {
  posts: PostData[];
}

// Category Modal Component
interface CategoryModalProps {
  visible: boolean;
  onClose: () => void;
  categoryName: string;
}

function CategoryModal({ visible, onClose, categoryName }: CategoryModalProps) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalCard}>
            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={42} color={Colors.light.logoPink} />
            </TouchableOpacity>

            {/* Modal Title */}
            <Text style={styles.modalCategoryTitle}>
              {categoryData.category}
            </Text>

            {/* Content Info */}
            <Text style={styles.modalTitle}>{categoryData.title}</Text>

            {/* Details Grid */}
            <View style={styles.detailsContainer}>
              <View style={styles.modalImageContainer}>
                <Image
                  source={{ uri: categoryData.image_url }}
                  style={styles.modalImage}
                  defaultSource={PlaceholderReferenceImage}
                />
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Director:</Text>
                <Text style={styles.detailValue}>{categoryData.creator}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Voice Actors:</Text>
                <Text style={styles.detailValue}>{categoryData.actors}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Duration:</Text>
                <Text style={styles.detailValue}>{categoryData.duration}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Seasons:</Text>
                <Text style={styles.detailValue}>{categoryData.seasons}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Description:</Text>
                <Text style={styles.detailValue}>{categoryData.description}</Text>
              </View>
              <View style={styles.tagsContainer}>
                {categoryData.tags.split(', ').map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// Separate component for each post to handle hooks properly
interface PostItemProps {
  postData: PostData;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onReactionPress: (reaction: "like" | "dislike") => void;
}

const testDescription = 'Beyond the cliffs and crashing waves lies a trail few have dared to follow.';

function PostItem({ postData, isExpanded, onToggleExpand, onReactionPress }: PostItemProps) {
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
        heartState.value = "#bcb1d1";
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
    <View style={styles.postCard}>
      {/* First Line */}
      <View style={styles.firstLine}>
        <View style={styles.iconButton}>
          <MaterialCommunityIcons
            name={
              localHeart === "#bcb1d1" ? "heart-broken" : "heart-broken-outline"
            }
            size={36}
            color={"#bcb1d1"}
          />
        </View>
        <Text style={styles.usernameText}>Art</Text>
        <View style={styles.iconButton}>
          <MaterialCommunityIcons
            name={
              localHeart === "red" ? "heart" : "heart-outline"
            }
            size={36}
            color={"#bcb1d1"}
          />
        </View>
      </View>

      {/* Second Line - Image */}
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.image, animatedStyle]}>
          <Image
            // source={imageUrl ? imageUrl : PlaceholderImage}
            source={PlaceholderImage}
            // style={StyleSheet.absoluteFill}
            style={styles.image}
            defaultSource={PlaceholderImage}
            onError={(e) =>
              console.log("Image failed to load:", e.nativeEvent.error)
            }
          />
        </Animated.View>
      </PanGestureHandler>

      {/* Third Line */}
      <View style={styles.metaRow}>
        {/* <View style={styles.imageBelowFirstLine}>
          <Text style={styles.categoryText}>
            {post.like_count} likes • {post.dislike_count} dislikes
          </Text>
        </View> */}
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
            <Text style={{color: Colors.light.bioTextColor, fontFamily: 'Milkyway', fontSize: 24}}>Gris</Text>
            <TouchableOpacity onPress={onToggleExpand}>
              <Text
                style={styles.descriptionText}
                numberOfLines={isExpanded ? undefined : 2}
              >
                {testDescription}
                {!isExpanded && testDescription.length > 100 && "... more"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Fifth Line - Date */}
      <View style={styles.hashtagRow}>
        {/* {postData.reaction && (
          <TouchableOpacity onPress={() => onReactionPress(postData.reaction!)}>
            <Text style={[styles.hashtag, styles.reactionHashtag, { backgroundColor: postData.reaction === 'like' ? '#e8f5e8' : '#fde8e8' }]}>
              {postData.reaction}
            </Text>
          </TouchableOpacity>
        )}
        <Text style={styles.hashtag}>
          {new Date(post.created_at).toLocaleDateString()}
        </Text>
        <Text style={styles.hashtag}>
          {post.privacy}
        </Text> */}
        <TouchableOpacity onPress={() => onReactionPress(postData.reaction!)}>
          <View style={{display: 'flex', flexDirection: 'row', backgroundColor: Colors.light.textPink, justifyContent: 'center', alignItems: 'center', height: 28, width: 100, borderRadius: 14, gap: 2}}>
            <Text style={{fontFamily: 'Milkyway', color: Colors.light.textPink, backgroundColor: Colors.light.cardBackgroundColor, width: 12, height: 12, borderRadius: 20, textAlign: 'center', fontSize: 12}}>R</Text>
            <Text style={{fontFamily: 'Milkyway', color: Colors.light.whiteText}}>
              Starry Night
            </Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.hashtag}>
          #DigitalArt
        </Text>
        <Text style={styles.hashtag}>
          #AIGenerated
        </Text>
        <Text style={styles.hashtag}>
          #Summer
        </Text>
      </View>
    </View>
  );
}

export default function CreatorScreen() {
  const colorScheme = useColorScheme();
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
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

  const handleCategoryPress = (category: string) => {
    setSelectedCategory(category);
    // setModalVisible(true);
  };

  const handleReactionPress = (reaction: "like" | "dislike") => {
    setSelectedCategory(reaction);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedCategory("");
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
    <>
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
              onReactionPress={handleReactionPress}
            />
          ))
        )}
      </ScrollView>

      {/* Category Modal */}
      <CategoryModal 
        visible={modalVisible}
        onClose={closeModal}
        categoryName={selectedCategory}
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