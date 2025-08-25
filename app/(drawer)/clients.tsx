import { ClientsScreen } from '@/components/clients/ClientsScreen';
import { BodyText, Heading1 } from "@/components/CustomText";
import { FAB } from '@/components/FAB';
import { ThemedView } from '@/components/ThemedView';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import React from 'react';
import { View } from "react-native";

export default function ClientsPage() {
  const navigation = useNavigation();
  return (
    <View style={{ flex: 1, backgroundColor: "#fff"}}>
      {/* Header fixe */}
      <ThemedView className="p-6 border-b border-gray-200" lightColor="#ffffff" darkColor="#000000">
        <Heading1 style={{ color: "#4C4D5C", textAlign: "center", marginTop: 40, marginBottom: 10 }}>
          Clients
        </Heading1>
        <BodyText style={{ color: "#666", textAlign: "center" }}>
          Gérez vos clients et consultez leurs informations
        </BodyText>
      </ThemedView>

      {/* Liste avec défilement intégré */}
      <View style={{ flex: 1 }}>
        <ClientsScreen />
      </View>
      
      <FAB onPress={() => navigation.dispatch(DrawerActions.openDrawer())} />
    </View>
  );
}