import { posts } from "@/data/posts";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
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

const PlaceholderImage = require("@/assets/images/background-image.png");
const PlaceholderProfileImage = require("@/assets/images/react-logo.png");

const categories = [
  "For you", "Movies", "Crochet", "Moto", "Games", "Dota 2", "Counter-Strike 2",
  "PUBG", "Me", "Shen", "Da", "Varskvlavebi", "Mze", "Ca", "Lurji", "Mdelo",
];

type HeartColor = "none" | "red" | "#fdebf1";

export default function CreatorScreen() {
  const colorScheme = useColorScheme();
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
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
      {posts.map((post) => {
        const isExpanded = expandedPostId === post.id;

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
            key={post.id} 
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
                  // color={
                  //   localHeart === "#fdebf1" ? "#fdebf1" : "#fdebf1"
                  // }
                  color={"#fdebf1"}
                />
              </View>
              <Text style={styles.usernameText}>@{post.username}</Text>
              <View style={styles.iconButton}>
                <MaterialCommunityIcons
                  name={
                    localHeart === "red" ? "heart" : "heart-outline"
                  }
                  size={28}
                  // color={
                  //   localHeart === "red" ? "red" : "#080e0e"
                  // }
                  color={"#fdebf1"}
                />
              </View>
                {/* <Image
                  source={{ uri: post.profileImage }}
                  style={styles.profileImage}
                  defaultSource={PlaceholderProfileImage}
                  onError={(e) =>
                    console.log("Image failed to load:", e.nativeEvent.error)
                  }
                /> */}
            </View>

            {/* Second Line -Image */}
            <PanGestureHandler onGestureEvent={gestureHandler}>
              <Animated.View style={[styles.image, animatedStyle]}>
                <Image
                  source={{ uri: post.image }}
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
                <Text style={styles.categoryText}>{post.title}</Text>
              </LinearGradient>
              <View style={styles.iconGroup}>
                <TouchableOpacity style={styles.iconButton}>
                  <Ionicons name="chatbubble-outline" size={22} color={Colors.light.gradientPurpleDark} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}>
                  <Ionicons name="bookmark-outline" size={22} color={Colors.light.gradientBlueDark} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Fourth Line - Description */}
            <TouchableOpacity
              onPress={() => setExpandedPostId(isExpanded ? null : post.id)}
            >
              <Text
                style={styles.descriptionText}
                numberOfLines={isExpanded ? undefined : 2}
              >
                {post.description}
                {!isExpanded && post.description.length > 100 && "... more"}
              </Text>
            </TouchableOpacity>

            {/* Fifth Line - Hashtags */}
            <View style={styles.hashtagRow}>
              {post.hashtags.map((tag, index) => (
                <Text key={index} style={styles.hashtag}>{tag}</Text>
              ))}
            </View>
          </LinearGradient>
        );
      })}
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
});
