import { AuthProvider } from "@/context/AuthContext";
import {
  Arimo_400Regular,
  Arimo_400Regular_Italic,
  Arimo_500Medium,
  Arimo_600SemiBold,
  Arimo_700Bold,
  Arimo_700Bold_Italic,
} from '@expo-google-fonts/arimo';
import {
  DMSans_400Regular,
  DMSans_400Regular_Italic,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
  DMSans_700Bold_Italic,
} from '@expo-google-fonts/dm-sans';
import { useFonts } from 'expo-font';
import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Arimo_400Regular,
    Arimo_500Medium,
    Arimo_600SemiBold,
    Arimo_700Bold,
    Arimo_400Regular_Italic,
    Arimo_700Bold_Italic,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    DMSans_400Regular_Italic,
    DMSans_700Bold_Italic,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen 
          name="client-detail" 
          options={{ 
            headerShown: false,
            presentation: "card" 
          }} 
        />
        <Stack.Screen 
          name="client-edit" 
          options={{ 
            headerShown: false,
            presentation: "modal" 
          }} 
        />
        <Stack.Screen name="+not-found" />
      </Stack>
    </AuthProvider>
  );
}