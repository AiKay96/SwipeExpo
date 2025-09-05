import { Colors } from '@/constants/Colors';
import { AuthProvider } from "@/utils/authContext";
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { LogBox, View, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { useColorScheme } from '@/hooks/useColorScheme';

LogBox.ignoreAllLogs(true);

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    'Milkyway': require('../assets/fonts/MilkywayDEMO-01.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <GestureHandlerRootView style={{flex: 1}}>
        <ThemeProvider value={DefaultTheme}>
          <StatusBar style="auto" />
          <View style={styles.container}>
            <Stack>
              <Stack.Screen name="(protected)" options={{headerShown: false}} />
              <Stack.Screen name="sign-in" options={{headerShown: false}} />
              <Stack.Screen name="create-account" options={{headerShown: true, headerTitle: "Back to Login", headerTintColor: Colors.light.textPurple}} />
              <Stack.Screen name="+not-found" options={{headerShown: false}} />
            </Stack>
          </View>
        </ThemeProvider>
      </GestureHandlerRootView>
    </AuthProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: "center",
    width: "100%",
    maxWidth: 500,
  },
});