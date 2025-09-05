import AsyncStorage from "@react-native-async-storage/async-storage";

const AUTH_STORAGE_KEY = "auth-key";

export async function getStoredToken(): Promise<string | null> {
  try {
    const raw = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const json = JSON.parse(raw);
    return json?.token ?? null; // { isLoggedIn, token }
  } catch {
    return null;
  }
}
