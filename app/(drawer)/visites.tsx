import { BodyText, Heading1 } from "@/components/CustomText";
import { FAB } from "@/components/FAB";
import { ThemedView } from "@/components/ThemedView";
import { VisitesList } from "@/components/visites/VisitesList";
import { VisitesSearchBar } from "@/components/visites/VisitesSearchBar";
import { VisiteCategory, VisitesTabs } from "@/components/visites/VisitesTabs";
import { useAuth } from "@/context/AuthContext";
import { useVisites } from "@/hooks/useVisites";
import { useVisiteSearch } from "@/hooks/useVisiteSearch";
import { useVisitesProgrammees } from "@/hooks/useVisitesProgrammees";
import { servicesWebApi } from "@/services/servicesWebApi";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";


export default function VisitesScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<VisiteCategory>('programmee');
  const [searchQuery, setSearchQuery] = useState('');

  // Hooks pour récupérer les données
  const { visites, loading: visitesLoading, error: visitesError, refreshVisites } = useVisites();
  const { visitesProgrammees, loading: visitesProgrammeesLoading, error: visitesProgrammeesError, refreshVisitesProgrammees } = useVisitesProgrammees();

  // Sélectionner les données selon l'onglet actif
  const currentVisites = activeTab === 'programmee' ? visitesProgrammees : visites;
  const currentLoading = activeTab === 'programmee' ? visitesProgrammeesLoading : visitesLoading;
  const currentError = activeTab === 'programmee' ? visitesProgrammeesError : visitesError;

  // Recherche filtrée
  const filteredVisites = useVisiteSearch(currentVisites, searchQuery, activeTab);

  const handleRefresh = async () => {
    if (activeTab === 'programmee') {
      await refreshVisitesProgrammees();
    } else {
      await refreshVisites();
    }
  };

  const handleVisitePress = (visite: any) => {
    console.log('Voir détails visite:', visite);
    router.push(`/(drawer)/visite-detail?id=${visite.id}`);
  };

  const handleVisiteEdit = (visite: any) => {
    console.log('Éditer visite:', visite);
    router.push(`/(drawer)/visite-edit?id=${visite.id}`);
  };

  const handleVisiteDelete = async (visite: any) => {
    Alert.alert(
      "Supprimer la visite",
      `Êtes-vous sûr de vouloir supprimer la visite pour "${visite.client_nom}" ?\n\nCette action ne peut pas être annulée.`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              console.log('Suppression de la visite:', visite.id);
              await servicesWebApi.deleteVisite(visite.id, token!);
              
              Alert.alert(
                "Succès", 
                "La visite a été supprimée avec succès",
                [{ text: "OK" }]
              );
              
              // Rafraîchir la liste des visites
              if (activeTab === 'programmee') {
                await refreshVisitesProgrammees();
              } else {
                await refreshVisites();
              }
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
              Alert.alert(
                "Erreur",
                error instanceof Error ? error.message : "Erreur lors de la suppression de la visite"
              );
            }
          },
        },
      ]
    );
  };

  const handleAddPress = () => {
    console.log('Ajouter une visite');
    router.push('/(drawer)/visite-new');
  };

  const getPlaceholderText = () => {
    switch (activeTab) {
      case 'programmee':
        return 'Rechercher une visite programmée...';
      case 'historique':
        return "Rechercher dans l'historique des visites...";
      default:
        return 'Rechercher...';
    }
  };

  const isLoading = currentLoading;

  return (
    <View style={styles.container}>
      {/* Header fixe */}
      <ThemedView className="p-6 border-b border-gray-200" lightColor="#ffffff" darkColor="#000000">
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 40, marginBottom: 10 }}>
          <Heading1 style={{ color: "#4C4D5C", textAlign: "center", flex: 2 }}>
            Visites
          </Heading1>
          <TouchableOpacity
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
            onPress={handleAddPress}
          >
            <Plus size={25} color="#fff" />
          </TouchableOpacity>
        </View>
        <BodyText style={{ color: "#666", textAlign: "center" }}>
          Gérez vos visites clients et consultez leurs informations
        </BodyText>
      </ThemedView>
    
      {/* Onglets */}
      <VisitesTabs 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      {/* Barre de recherche */}
      <VisitesSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder={getPlaceholderText()}
      />

      {/* Liste */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            colors={["#FF6B6B"]}
            tintColor="#FF6B6B"
          />
        }
      >
        <VisitesList
          visites={filteredVisites}
          onItemPress={handleVisitePress}
          onEditPress={handleVisiteEdit}
          onDeletePress={handleVisiteDelete}
          loading={currentLoading}
        />
      </ScrollView>

      <FAB onPress={() => navigation.dispatch(DrawerActions.openDrawer())} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  content: {
    flex: 1,
  },
  addButton: {
    backgroundColor: "#2563eb",
    borderRadius: 50,
    width: 45,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
});
