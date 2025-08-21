import CreatePostModal from '@/components/CreatePostModal';
import { Colors } from '@/constants/Colors';
import { AntDesign, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs } from "expo-router";
import { useState } from 'react';
import { Image, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

const PlaceholderProfileImage = require("@/assets/images/swipe-logo.png");

function CustomHeader() {
  return (
    <View style={styles.headerContainer}>
      <Image
        source={PlaceholderProfileImage}
        style={styles.profileImage}
        defaultSource={PlaceholderProfileImage}
        onError={(e) =>
          console.log("Image failed to load:", e.nativeEvent.error)
        }
      />
      <View style={{display: "flex", flexDirection: "row", alignItems: "center", gap: 10}}>
        <LinearGradient 
          style={styles.searchWrapper} 
          colors={[Colors.light.gradientPink, Colors.light.gradientBlue]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="search" size={18} color={Colors.light.textPurple} style={styles.searchIcon} />
          <TextInput
            placeholder="Search"
            placeholderTextColor={Colors.light.textPurple}
            style={styles.searchInput}
          />
        </LinearGradient>
        <TouchableOpacity>
          <AntDesign name="message1" size={22} color={Colors.light.textPurple} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <>
      <Tabs
        screenOptions={{
          headerTitle: () => <CustomHeader />,
          tabBarActiveTintColor: Colors.light.iconDark, 
          tabBarInactiveTintColor: Colors.light.iconLight,
          tabBarShowLabel: false,
          headerStyle: {
            backgroundColor: "#fff",
          },
          headerShadowVisible: false,
          headerTintColor: "#fff",
          tabBarStyle: {
            backgroundColor: "#fff",
          },
        }}
      >
        <Tabs.Screen 
          name="index" 
          options={{
            tabBarIcon: ({focused, color}) => (
              <Ionicons 
                name={focused ? "home" : "home-outline"} 
                size={24} 
                color={color} 
              />
            ),
          }} 
        />
        <Tabs.Screen
          name="personal"
          options={{
            tabBarIcon: ({ focused, color }) => (
              <FontAwesome5
                name="user-friends"
                size={20}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="plus"
          options={{
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name={focused ? "add-circle-outline" : "add-circle"}
                size={28}
                color={color}
              />
            ),
          }}
          listeners={{
            tabPress: (e) => {
              console.log("Plus tab pressed!"); // Add this for debugging
              e.preventDefault();
              setShowCreateModal(true);
            },
          }}
        />
        <Tabs.Screen
          name="suggests"
          options={{
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name={focused ? "heart" : "heart-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name={focused ? "person-circle" : "person-circle-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
      
      <CreatePostModal 
        visible={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
      />
    </>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    width: "100%",
  },
  title: {
    color: "#080e0e",
    fontSize: 20,
    fontWeight: "bold",
    paddingBottom: 2,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f7fa",
    borderRadius: 10,
    paddingHorizontal: 8,
    height: 36,
    width: 140,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingBottom: 9,
  },
  profileImage: {
    width: 120,
    height: 40,
    resizeMode: "contain",
    marginTop: 6
  },
});