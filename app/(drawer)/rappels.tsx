import { FAB } from '@/components/FAB';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import React from 'react';
import { View } from 'react-native';

export default function RappelsScreen() {
  const navigation = useNavigation();
  return (
    <View style={{ flex: 1 }}>
      <ThemedView className="flex-1 items-center justify-center p-6" lightColor="#ffffff" darkColor="#000000">
        <ThemedText className="text-3xl font-bold text-black">Rappels</ThemedText>
        <ThemedText className="mt-2 text-black dark:text-gray-300">Placeholder écran Rappels</ThemedText>
      </ThemedView>
      <FAB onPress={() => navigation.dispatch(DrawerActions.openDrawer())} />
    </View>
  );
}


