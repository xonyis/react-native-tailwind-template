import { BodyText, Heading1 } from "@/components/CustomText";
import { FAB } from "@/components/FAB";
import { EmailsList } from "@/components/services-web/EmailsList";
import { HebergementsList } from "@/components/services-web/HebergementsList";
import { ServicesWebSearchBar } from "@/components/services-web/ServicesWebSearchBar";
import { ServicesWebTabs, ServiceWebCategory } from "@/components/services-web/ServicesWebTabs";
import { SitesList } from "@/components/services-web/SitesList";
import { ThemedView } from "@/components/ThemedView";
import { useEmails } from "@/hooks/useEmails";
import { useEmailsSearch } from "@/hooks/useEmailsSearch";
import { useHebergements } from "@/hooks/useHebergements";
import { useHebergementsSearch } from "@/hooks/useHebergementsSearch";
import { useSites } from "@/hooks/useSites";
import { useSitesSearch } from "@/hooks/useSitesSearch";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View
} from "react-native";



export default function ServicesWebScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<ServiceWebCategory>('hebergements');
  const [searchQuery, setSearchQuery] = useState('');

  // Hooks pour récupérer les données
  const { hebergements, loading: hebergementsLoading, error: hebergementsError, refreshHebergements } = useHebergements();
  const { sites, loading: sitesLoading, error: sitesError, refreshSites } = useSites();
  const { emails, loading: emailsLoading, error: emailsError, refreshEmails } = useEmails();

  // Recherche filtrée
  const filteredHebergements = useHebergementsSearch(hebergements, searchQuery);
  const filteredSites = useSitesSearch(sites, searchQuery);
  const filteredEmails = useEmailsSearch(emails, searchQuery);

  const handleRefresh = async () => {
    if (activeTab === 'hebergements') {
      await refreshHebergements();
    } else if (activeTab === 'sites') {
      await refreshSites();
    } else if (activeTab === 'boites-mail') {
      await refreshEmails();
    }
  };

  const handleHebergementPress = (hebergement: any) => {
    console.log('Voir détails hébergement:', hebergement);
    Alert.alert('Détails', `Voir les détails de ${hebergement.url}`);
  };

  const handleHebergementEdit = (hebergement: any) => {
    console.log('Éditer hébergement:', hebergement);
    Alert.alert('Édition', `Éditer ${hebergement.url}`);
  };

  const handleHebergementDelete = (hebergement: any) => {
    Alert.alert(
      "Supprimer l'hébergement",
      `Êtes-vous sûr de vouloir supprimer "${hebergement.url}" ?\n\nCette action ne peut pas être annulée.`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => {
            console.log('Supprimer hébergement:', hebergement);
            Alert.alert('Supprimé', `${hebergement.url} a été supprimé`);
          },
        },
      ]
    );
  };

  const handleSitePress = (site: any) => {
    console.log('Voir détails site:', site);
    Alert.alert('Détails', `Voir les détails de ${site.url}`);
  };

  const handleSiteEdit = (site: any) => {
    console.log('Éditer site:', site);
    Alert.alert('Édition', `Éditer ${site.url}`);
  };

  const handleSiteDelete = (site: any) => {
    Alert.alert(
      "Supprimer le site",
      `Êtes-vous sûr de vouloir supprimer "${site.url}" ?\n\nCette action ne peut pas être annulée.`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => {
            console.log('Supprimer site:', site);
            Alert.alert('Supprimé', `${site.url} a été supprimé`);
          },
        },
      ]
    );
  };

  const handleEmailPress = (email: any) => {
    console.log('Voir détails email:', email);
    Alert.alert('Détails', `Voir les détails de ${email.adresse_email}`);
  };

  const handleEmailEdit = (email: any) => {
    console.log('Éditer email:', email);
    Alert.alert('Édition', `Éditer ${email.adresse_email}`);
  };

  const handleEmailDelete = (email: any) => {
    Alert.alert(
      "Supprimer l'email",
      `Êtes-vous sûr de vouloir supprimer "${email.adresse_email}" ?\n\nCette action ne peut pas être annulée.`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => {
            console.log('Supprimer email:', email);
            Alert.alert('Supprimé', `${email.adresse_email} a été supprimé`);
          },
        },
      ]
    );
  };

  const handleAddPress = () => {
    console.log('Ajouter un service');
    Alert.alert('Ajouter', `Ajouter un nouveau service ${activeTab}`);
  };

  const getPlaceholderText = () => {
    switch (activeTab) {
      case 'hebergements':
        return 'Rechercher un hébergement...';
      case 'boites-mail':
        return 'Rechercher une boîte mail...';
      case 'sites':
        return 'Rechercher un site...';
      default:
        return 'Rechercher...';
    }
  };

  const isLoading = (activeTab === 'hebergements' && hebergementsLoading) || 
                   (activeTab === 'sites' && sitesLoading) ||
                   (activeTab === 'boites-mail' && emailsLoading);

  return (
    <View style={styles.container}>
      {/* Header fixe */}
      <ThemedView className="p-6 border-b border-gray-200" lightColor="#ffffff" darkColor="#000000">
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 40, marginBottom: 10 }}>
          <Heading1 style={{ color: "#4C4D5C", textAlign: "center", flex: 2 }}>
            Services Web
          </Heading1>

        </View>
        <BodyText style={{ color: "#666", textAlign: "center" }}>
          Gérez vos services web et consultez leurs informations
        </BodyText>
      </ThemedView>
    
      {/* Onglets */}
      <ServicesWebTabs 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      {/* Barre de recherche */}
      <ServicesWebSearchBar
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
            colors={["#2563eb"]}
            tintColor="#2563eb"
          />
        }
      >
        {activeTab === 'hebergements' && (
          <HebergementsList
            hebergements={filteredHebergements}
            onItemPress={handleHebergementPress}
            onEditPress={handleHebergementEdit}
            onDeletePress={handleHebergementDelete}
            loading={hebergementsLoading}
          />
        )}
        
        {activeTab === 'sites' && (
          <SitesList
            sites={filteredSites}
            onItemPress={handleSitePress}
            onEditPress={handleSiteEdit}
            onDeletePress={handleSiteDelete}
            loading={sitesLoading}
          />
        )}
        
        {activeTab === 'boites-mail' && (
          <EmailsList
            emails={filteredEmails}
            onItemPress={handleEmailPress}
            onEditPress={handleEmailEdit}
            onDeletePress={handleEmailDelete}
            loading={emailsLoading}
          />
        )}
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
});


