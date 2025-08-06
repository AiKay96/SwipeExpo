import { Colors } from '@/constants/Colors';
import { StyleSheet, Text, View } from "react-native";

export default function SuggestsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.halfContainer}>
        <Text>Friend Requests:</Text>
        <View style={{display: "flex", flexDirection: "row", justifyContent: "space-between"}}>
          <Text>Reject</Text>
          <Text>@ghibli1over</Text>
          <Text>Reject</Text>
        </View>
        <Text>Aq Iqneba Photo</Text>
        <Text>Interest Match: 80%</Text>
      </View>
      <View style={styles.tabBar}></View>
      <View style={styles.halfContainer}>
        <Text>Suggestions:</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    height: "100%",
  },
  halfContainer: {
    // height: "50%",
    display: "flex",
    // justifyContent: "center",
    // alignItems: "center",
    width: "65%",
  },
  text: {
    color: Colors.light.textPurple,
  },
  tabBar: {
    // flexDirection: "row",
    // justifyContent: "space-around",
    // backgroundColor: "#fff",
    // paddingVertical: 12,
    borderBottomColor: Colors.light.iconLight,
    borderBottomWidth: 1,
    width: "100%"
  },
});