import { Colors } from '@/constants/Colors';
import { Feather } from "@expo/vector-icons";
import { Stack, usePathname, useRouter } from "expo-router";
import { useState } from "react";
import { Image, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import SettingsScreen from "./settings";

const PlaceholderProfileImage = require("@/assets/images/profile-image-example.jpg");

export default function ProfileLayout() {
  const router = useRouter();
  const pathname = usePathname();

  const [modalVisible, setModalVisible] = useState(false);

  const getRoute = (name: string) => (name === "index" ? "/profile" : `/profile/${name}`);

  const isActive = (name: string) => pathname === getRoute(name);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.profileCardContainer}>
        <View style={styles.profileCard}>
          <Image
            // source={{ uri: post.profileImage }}
            source={PlaceholderProfileImage}
            style={styles.profileImage}
            defaultSource={PlaceholderProfileImage}
            onError={(e) =>
              console.log("Image failed to load:", e.nativeEvent.error)
            }
            />
          <View style={{width: 170}}>
            <Text style={styles.displayName}>Display Name</Text>
            <Text style={{color: Colors.light.gradientPurpleDark}}>@username</Text>
            <View style={{display: "flex", flexDirection: "row", justifyContent: "space-between"}}>
              <Text style={{color: Colors.light.referenceText}}>friends: 2</Text>
              <Text style={{color: Colors.light.referenceText}}>followers: 15</Text>
            </View>
            <Text style={{color: Colors.light.referenceText}}>Age: 25</Text>
          </View>
        </View>
        <View style={{display: "flex", gap: 8, alignItems: "center", paddingHorizontal: 20, paddingVertical: 10}}>
          <Text  style={{color: Colors.light.textPurple}}>When the last light fades over the ridge, the forest awakens with ancient rhythms</Text>
          {/* <View style={{maxWidth: 140, paddingTop: 8}}>
            <Button title="Edit Profile" />
          </View> */}
        </View>
        <TouchableOpacity 
          style={{position: "absolute", top: 8, right: 30}}
          onPress={() => setModalVisible(true)}
        >
          <Feather name="menu" size={22} color={Colors.light.textPurple} />
        </TouchableOpacity>
      </View>
      <View style={styles.tabBar}>
        <Pressable
          onPress={() => router.navigate(getRoute("index"))}
          style={[styles.tabItem, isActive("index") && styles.activeTab]}
        >
          <Text style={[styles.tabText, isActive("index") && styles.activeText]}>
            Creator
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.navigate(getRoute("personal"))}
          style={[styles.tabItem, isActive("personal") && styles.activeTab]}
        >
          <Text style={[styles.tabText, isActive("personal") && styles.activeText]}>
            Personal
          </Text>
        </Pressable>

        {/* <Pressable
          onPress={() => router.navigate(getRoute("settings"))}
          style={[styles.tabItem, isActive("settings") && styles.activeTab]}
        >
          <Text style={[styles.tabText, isActive("settings") && styles.activeText]}>
            Settings
          </Text>
        </Pressable> */}
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
    backgroundColor: "#fff",
    padding: 8,
  },
  profileCard: {
    display: "flex",
    flexDirection: "row",
    position: "relative",
    paddingHorizontal: 20,
    gap: 16,
  },
  displayName: {
    fontSize: 18, 
    fontWeight: "500",
    color: Colors.light.textPurple,
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.iconLight,
  },
  tabText: {
    color: Colors.light.gradientPurpleDark,
    fontSize: 16,
  },
  tabItem: {
    paddingBottom: 6,
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
    width: 100,
    height: 100,
    borderRadius: 100,
  },
});
