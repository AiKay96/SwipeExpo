import { Colors } from '@/constants/Colors';
import { Feather, MaterialIcons, AntDesign } from "@expo/vector-icons";
import { Stack, usePathname, useRouter } from "expo-router";
import { useState } from "react";
import { Image, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import SettingsScreen from "./settings";

const PlaceholderProfileImage = require("@/assets/images/broken-image-dark.png");

export default function ProfileLayout() {
  const router = useRouter();
  const pathname = usePathname();

  const [modalVisible, setModalVisible] = useState(false);

  const getRoute = (name: string) => (name === "index" ? "/profile" : `/profile/${name}`);

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

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.profileCardContainer}>
        <View style={styles.profileCard}>
          <Text style={styles.displayName}>Gris</Text>
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
          // source={{ uri: post.profileImage }}
          source={PlaceholderProfileImage}
          style={styles.profileImage}
          defaultSource={PlaceholderProfileImage}
          onError={(e) =>
            console.log("Image failed to load:", e.nativeEvent.error)
          }
        />
        <TouchableOpacity 
          style={{position: "absolute", top: 8, right: 30}}
          onPress={() => setModalVisible(true)}
        >
          <Feather name="menu" size={22} color={Colors.light.textPurple} />
        </TouchableOpacity>
      </View>
      <View style={{display: "flex", alignItems: "center", justifyContent: 'center', paddingTop: 80, backgroundColor: Colors.light.cardBackgroundColor, zIndex: -1}}>
        <View style={{display: "flex", gap: 4, alignItems: "center", paddingHorizontal: 20, paddingVertical: 10}}>
          <Text style={{color: Colors.light.profileText, fontFamily: 'Milkyway', fontSize: 26}}>@gris</Text>
          <Text style={{color: Colors.light.profileText, fontFamily: 'Milkyway', fontSize: 16}}><strong>15</strong> followers</Text>
          <Text style={{color: Colors.light.profileText, fontFamily: 'Milkyway', fontSize: 16, textAlign: 'center',}}>
            When the last light fades over the ridge, the forest awakens with ancient rhythms
          </Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleCalculateMatchRate}
          >
            <Text style={styles.buttonText}>Followed</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <SettingsScreen onClose={() => setModalVisible(false)} />
      </Modal>
      <Stack screenOptions={{ headerShown: false }} />
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
    fontSize: 16,
    textAlign: 'center',
  },
  tabItem: {
    paddingBottom: 6,
    paddingTop: 46,
  },
  activeTab: {
    borderBottomColor: Colors.light.textPurple,
    borderBottomWidth: 2,
  },
  activeText: {
    color: Colors.light.textPurple,
    fontWeight: "bold",
  },
  profileImage: {
    width: 182,
    height: 182,
    borderRadius: 200,
    position: 'absolute',
    borderColor: Colors.light.mainBackgroundColor,
    borderWidth: 10,
    top: 110,
  },
  buttonContainer: {
    // paddingHorizontal: 40,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.mainBackgroundColor,
    paddingHorizontal: 16,
    // paddingVertical: 10,
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