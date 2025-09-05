import { Platform } from "react-native";

// Local fallbacks for dev if envs are missing:
const FALLBACK_URL_ANDROID = "http://10.0.2.2:8000";
const FALLBACK_URL_IOS = "http://localhost:8000";

/**
 * API_URL must be absolute, like http://host:port
 * For Android emulator, backend on host must be 10.0.2.2
 */
export const API_URL =
  Platform.OS === "android"
    ? process.env.EXPO_PUBLIC_API_URL_ALTERNATIVE || FALLBACK_URL_ANDROID
    : process.env.EXPO_PUBLIC_API_URL || FALLBACK_URL_IOS;

if (!/^https?:\/\//.test(API_URL)) {
  console.warn("[config] API_URL looks invalid:", API_URL);
}
