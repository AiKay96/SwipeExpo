import { Colors } from '@/constants/Colors';
import { AuthProvider } from "@/utils/authContext";
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { LogBox } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { useColorScheme } from '@/hooks/useColorScheme';

LogBox.ignoreAllLogs(true);

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    'Milkyway': require('../assets/fonts/Milkyway-DEMO.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <AuthProvider>
      <GestureHandlerRootView style={{flex: 1}}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <StatusBar style="auto" />
          <Stack>
            <Stack.Screen name="(protected)" options={{headerShown: false}} />
            <Stack.Screen name="sign-in" options={{headerShown: false}} />
            <Stack.Screen name="create-account" options={{headerShown: true, headerTitle: "Back to Login", headerTintColor: Colors.light.textPurple}} />
            <Stack.Screen name="+not-found" options={{headerShown: false}} />
          </Stack>
        </ThemeProvider>
      </GestureHandlerRootView>
    </AuthProvider>
  )
}