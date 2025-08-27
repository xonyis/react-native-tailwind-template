import { ContratsScreen } from '@/components/contrats/ContratsScreen';
import { BodyText, Heading1 } from "@/components/CustomText";
import { FAB } from '@/components/FAB';
import { ThemedView } from '@/components/ThemedView';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';

import { Plus } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from "react-native";

export default function ContratsPage() {
  const navigation = useNavigation();
  const router = useRouter();

  const handleCreateContrat = () => {
    router.push({
      pathname: '/(drawer)/contrat-new',
      params: {}
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff"}}>
      {/* Header fixe */}
      <ThemedView className="p-6 border-b border-gray-200" lightColor="#ffffff" darkColor="#000000">
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 40, marginBottom: 10 }}>
        <Heading1 style={{ color: "#4C4D5C", textAlign: "center", flex: 2 }}>
            Contrats
          </Heading1>
          
          <TouchableOpacity 
            onPress={handleCreateContrat}
            style={{ 
              position: 'absolute',
              right: 0,
              backgroundColor: '#2563eb', 
              width: 45,
              height: 45,
              borderRadius: 50,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          >
            <Plus size={25} color="#fff" />
          </TouchableOpacity>
        </View>
        <BodyText style={{ color: "#666", textAlign: "center" }}>
          Gérez vos contrats et consultez leurs informations
        </BodyText>
      </ThemedView>

      {/* Liste avec défilement intégré */}
      <View style={{ flex: 1 }}>
        <ContratsScreen />
      </View>
      
      <FAB onPress={() => navigation.dispatch(DrawerActions.openDrawer())} />
    </View>
  );
}


