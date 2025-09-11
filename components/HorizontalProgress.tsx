import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type HorizontalProgressProps = {
  percentage: number;
};

const HorizontalProgress: React.FC<HorizontalProgressProps> = ({ percentage }) => {
  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <LinearGradient
          colors={["#A8D5FF", "#F7A8D5"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fill, { width: `${percentage}%` }]}
        />
      </View>
      <View style={styles.textWrapper}>
        <Text style={styles.text}>{percentage}% Match Rate</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 250,
    height: 35,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#a88cbc",
    justifyContent: "center",
    borderWidth: 5,
    borderColor: '#a88cbc',
  },
  track: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 20,
  },
  textWrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontFamily: "Milkyway",
    fontSize: 16,
    color: "white",
  },
});

export default HorizontalProgress;
