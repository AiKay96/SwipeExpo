import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StyleSheet, Text, TextInput, View } from "react-native";

function CustomHeader() {
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.title}>Swipe</Text>
      <View style={styles.searchWrapper}>
        <Ionicons name="search" size={18} color="#999" style={styles.searchIcon} />
        <TextInput
          placeholder="Search"
          placeholderTextColor="#999"
          style={styles.searchInput}
        />
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerTitle: () => <CustomHeader />,
        tabBarActiveTintColor: "#f88d97", 
        tabBarShowLabel: false,
        headerStyle: {
          backgroundColor: "#0b0e16",
        },
        headerShadowVisible: false,
        headerTintColor: "#fff",
        tabBarStyle: {
          backgroundColor: "#0b0e16",
        },
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{
          tabBarIcon: ({focused, color}) => (
            <Ionicons 
              name={focused ? "briefcase" : "briefcase-outline"} 
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
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={24}
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
      />
      <Tabs.Screen
        name="messages"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "chatbubble" : "chatbubble-outline"}
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
  )
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
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    borderRadius: 8,
    paddingHorizontal: 8,
    height: 36,
    width: 160,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    color: "#fff",
    flex: 1,
    fontSize: 14,
  },
});