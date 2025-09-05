import AsyncStorage from "@react-native-async-storage/async-storage";
import { SplashScreen, useRouter } from "expo-router";
import { createContext, PropsWithChildren, useEffect, useState } from "react";
import { Platform } from "react-native";

SplashScreen.preventAutoHideAsync();

type AuthState = {
  isLoggedIn: boolean;
  isReady: boolean;
  token: string | null;
  logIn: (username: string, password: string) => Promise<boolean>;
  logOut: () => void;
};

const authStorageKey = "auth-key";
const API_URL = Platform.OS === 'android' ? process.env.EXPO_PUBLIC_API_URL_ALTERNATIVE : process.env.EXPO_PUBLIC_API_URL;

export const AuthContext = createContext<AuthState>({
  isLoggedIn: false,
  isReady: false,
  token: null,
  logIn: async () => false,
  logOut: () => {},
});

export function AuthProvider({ children }: PropsWithChildren) {
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  const storeAuthState = async (newState: { isLoggedIn: boolean; token?: string }) => {
    try {
      const jsonValue = JSON.stringify(newState);
      await AsyncStorage.setItem(authStorageKey, jsonValue);
    } catch (error) {
      console.log("Error saving auth state", error);
    }
  };

  const logIn = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "password",
          username,
          password,
          client_secret: password, // per your spec
        }).toString(),
      });

      if (!response.ok) {
        console.log("Login failed:", await response.text());
        return false;
      }

      const data = await response.json();
      const accessToken = data.access_token;

      setIsLoggedIn(true);
      setToken(accessToken);
      await storeAuthState({ isLoggedIn: true, token: accessToken });
      router.replace("/");
      return true;
    } catch (err) {
      console.log("Error logging in:", err);
      return false;
    }
  };

  const logOut = async () => {
    setIsLoggedIn(false);
    setToken(null);
    await storeAuthState({ isLoggedIn: false });
    router.replace("/sign-in");
  };

  useEffect(() => {
    const getAuthFromStorage = async () => {
      await new Promise((res) => setTimeout(() => res(null), 500));
      try {
        const value = await AsyncStorage.getItem(authStorageKey);
        if (value !== null) {
          const auth = JSON.parse(value);
          setIsLoggedIn(auth.isLoggedIn);
          setToken(auth.token);
        }
      } catch (error) {
        console.log("Error loading auth", error);
      }
      setIsReady(true);
    };
    getAuthFromStorage();
  }, []);

  useEffect(() => {
    if (isReady) SplashScreen.hideAsync();
  }, [isReady]);

  return (
    <AuthContext.Provider
      value={{
        isReady,
        isLoggedIn,
        token,
        logIn,
        logOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
