import ImageViewer from "@/components/ImageViewer";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const PlaceholderImage = require("@/assets/images/background-image.png");

const description = "Check out my latest build in React Native Expo! 🚀 This one has animations, transitions, and a super clean UI. Let me know what you think in the comments below.";

const categories = [
  "For you",
  "Movies",
  "Crochet",
  "Moto",
  "Games",
  "Dota 2",
  "Counter-Strike 2",
  "PUBG",
  "Me",
  "Shen",
  "Da",
  "Varskvlavebi",
  "Mze",
  "Ca",
  "Lurji",
  "Mdelo",
];

export default function CreatorScreen() {
  const [showFull, setShowFull] = useState(false);

  return (
    <View style={styles.container}>
      {/* Categories Bar */}
      <View style={{ height: 30, marginVertical: 10 }}>
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map((category, index) => (
            <View key={category} style={styles.categoryWrapper}>
              <Text style={styles.categoryText}>{category}</Text>
              {index !== categories.length - 1 && (
                <View style={styles.separator} />
              )}
            </View>
          ))}
        </ScrollView>
      </View>

      <ImageViewer imgSource={PlaceholderImage} />

      {/* First Line: Category + Icons */}
      <View style={styles.metaRow}>
        <Text style={styles.categoryText}>Tech</Text>
        <View style={styles.iconGroup}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="chatbubble-outline" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="bookmark-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Second Line: Description */}
      <TouchableOpacity onPress={() => setShowFull(!showFull)}>
        <Text
          style={styles.descriptionText}
          numberOfLines={showFull ? undefined : 2}
        >
          {description}
          {!showFull && description.length > 100 && "... more"}
        </Text>
      </TouchableOpacity>

      <View style={styles.hashtagRow}>
        <Text style={styles.hashtag}>#science</Text>
        <Text style={styles.hashtag}>#rocket</Text>
        <Text style={styles.hashtag}>#reactnative</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0e16",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  categoriesContainer: {
    alignItems: "center",
  },
  categoryWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    // maxHeight: 30,
  },
  // categoryText: {
  //   color: "#ffd33d",
  //   fontSize: 16,
  //   paddingHorizontal: 8,
  // },
  separator: {
    width: 1,
    height: 16,
    backgroundColor: "#86bcf8",
    opacity: 0.7,
  },
  metaRow: {
    marginTop: 12,
    width: 320,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: 500,
  },
  iconGroup: {
    flexDirection: "row",
    gap: 16,
  },
  iconButton: {
    padding: 4,
  },
  descriptionText: {
    marginTop: 8,
    width: 320,
    color: "#ddd",
    fontSize: 14,
    lineHeight: 20,
  },
  seeMore: {
    color: "#858585ff",
  },
  hashtagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    width: 320,
    gap: 8,
  },
  hashtag: {
    color: "#86bcf8",
    fontSize: 13,
  },
});
