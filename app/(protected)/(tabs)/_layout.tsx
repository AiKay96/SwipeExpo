import CreatePostModal from '@/components/CreatePostModal';
import { Colors } from '@/constants/Colors';
import { AntDesign, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import { useState } from 'react';
import { Image, StyleSheet, TextInput, TouchableOpacity, View, Dimensions } from "react-native";

const PlaceholderProfileImage = require("@/assets/images/swipe-logo2.png");
const { width, height } = Dimensions.get("window");

function CustomHeader() {
  const router = useRouter();

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
      <View style={{display: "flex", flexDirection: "row", alignItems: "center", gap: 10, paddingRight: 20}}>
        <TouchableOpacity onPress={() => router.push('/search')}>
          <View style={styles.searchWrapper}>
            <Ionicons name="search" size={18} color={Colors.light.inputText} style={styles.searchIcon} />
            <TextInput
              placeholder="Search"
              placeholderTextColor={Colors.light.inputText}
              style={styles.searchInput}
              editable={false}
              pointerEvents="none"
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/messages')}>
          <AntDesign name="message1" size={22} color={Colors.light.logoPink} />
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
          tabBarActiveTintColor: Colors.light.logoPink, 
          tabBarInactiveTintColor: Colors.light.inputText,
          tabBarShowLabel: false,
          headerStyle: {
            backgroundColor: Colors.light.mainBackgroundColor,
          },
          headerShadowVisible: false,
          headerTintColor: "#fff",
          tabBarStyle: {
            backgroundColor: "#fff",
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
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
              e.preventDefault();
              setShowCreateModal(true);
              console.log("Plus pressed");
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
        <Tabs.Screen
          name="search"
          options={{
            href: null, // exclude search.tsx
          }}
        />
        <Tabs.Screen
          name="messages/index"
          options={{
            href: null, // exclude messages/index.tsx
          }}
        />
        <Tabs.Screen
          name="messages/[username]"
          options={{
            href: null, // exclude messages/[username].tsx
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
    paddingVertical: 10,
    paddingHorizontal: 16,
    width: width,
    backgroundColor: Colors.light.mainBackgroundColor,
  },
  title: {
    color: "#080e0e",
    fontSize: 20,
    fontWeight: "bold",
    paddingBottom: 2,
    fontFamily: 'Milkyway',
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.cardBackgroundColor,
    borderRadius: 30,
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
    paddingTop: 2,
    width: 36,
    fontFamily: 'Milkyway',
  },
  profileImage: {
    width: 120,
    height: 40,
    resizeMode: "contain",
    marginTop: 6
  },
});