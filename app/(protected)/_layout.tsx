import { AuthContext } from "@/utils/authContext";
import { Redirect, Stack } from "expo-router";
import React, { useContext } from "react";

export const unstable_settings = {
  initialRouteName: "(tabs)", // anchor
};

export default function ProtectedLayout() {
  const authState = useContext(AuthContext);

  if(!authState.isReady) {
    return null;
  }

  if(!authState.isLoggedIn) {
    return <Redirect href="/sign-in" />
  }

  return (
    <Stack>
      {/* <Stack.Protected guard={isLoggedIn}> */}
        <Stack.Screen name="(tabs)" options={{headerShown: false}} />
      {/* </Stack.Protected> */}
      {/* <Stack.Protected guard={!isLoggedIn && hasCompletedOnboarding}>
        <Stack.Screen name="sign-in" options={{headerShown: false}} />
        <Stack.Protected guard={shouldCreateAccount}>
          <Stack.Screen name="create-account" options={{headerShown: false}} />
        </Stack.Protected>
      </Stack.Protected>
      <Stack.Protected guard={!hasCompletedOnboarding}>
        <Stack.Screen name="onboarding" options={{headerShown: false}} />
      </Stack.Protected> */}
    </Stack>
  )
}
