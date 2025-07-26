import { Stack, usePathname, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function ProfileLayout() {
  const router = useRouter();
  const pathname = usePathname();

  const getRoute = (name: string) => (name === "index" ? "/profile" : `/profile/${name}`);

  const isActive = (name: string) => pathname === getRoute(name);

  return (
    <View style={{ flex: 1 }}>
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

        <Pressable
          onPress={() => router.navigate(getRoute("settings"))}
          style={[styles.tabItem, isActive("settings") && styles.activeTab]}
        >
          <Text style={[styles.tabText, isActive("settings") && styles.activeText]}>
            Settings
          </Text>
        </Pressable>
      </View>
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#0b0e16",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  tabItem: {
    paddingBottom: 6,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#f88d97",
  },
  tabText: {
    color: "#ccc",
    fontSize: 16,
  },
  activeText: {
    color: "#f88d97",
    fontWeight: "bold",
  },
});
