import { Collapsible } from "@/components/Collapsible";
import { FAB } from "@/components/FAB";
import { HelloWave } from "@/components/HelloWave";
import { LogoutButton } from "@/components/LogoutButton";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { View } from "react-native";

export default function HomeScreen() {
  const navigation = useNavigation();
  return (
    <View style={{ flex: 1 }}>
      <ParallaxScrollView
        headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
        headerImage={
          <ThemedView
            className="flex-1 items-center justify-center"
            lightColor="#ffffff"
            darkColor="#000000"
          >
            <ThemedText className="text-3xl font-bold">Mon App</ThemedText>
            <HelloWave />
          </ThemedView>
        }
      >
        <ThemedView
          className="p-4 gap-4"
          lightColor="#ffffff"
          darkColor="#000000"
        >
          <View className="items-end">
            <LogoutButton />
          </View>
          <ThemedText className="text-2xl text-black font-bold">
            Bienvenue !
          </ThemedText>

          <Collapsible title="Fonctionnalités">
            <ThemedText className="text-black dark:text-gray-300">
              Voici les fonctionnalités de l&apos;app...
            </ThemedText>
          </Collapsible>

          <ThemedView
            className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg"
            lightColor="#ffffff"
            darkColor="#000000"
          >
            <ThemedText className="text-blue-800 dark:text-blue-200">
              Section mise en évidence
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ParallaxScrollView>
      <FAB onPress={() => navigation.dispatch(DrawerActions.openDrawer())} />
    </View>
  );
}



