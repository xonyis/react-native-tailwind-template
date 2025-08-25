import { useAuth } from '@/context/AuthContext';
import { useClients } from '@/hooks/useClients';
import { useClientSearch } from '@/hooks/useClientSearch';
import { Client } from '@/services/ClientsApi';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ClientList } from './ClientList';
import { SearchBar } from './SearchBar';

export const ClientsScreen: React.FC = () => {
  const { clients, loading, error, fetchClients } = useClients();
  const { signOut } = useAuth();
  const router = useRouter();
  
  const {
    searchQuery,
    setSearchQuery,
    filteredClients,
    clearSearch,
    hasActiveSearch,
    resultCount,
  } = useClientSearch(clients);

  const handleRefresh = () => {
    fetchClients();
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch {
      Alert.alert('Erreur', 'Impossible de se déconnecter');
    }
  };

  const handleClientPress = (client: Client) => {
    // Navigation vers la page de détail
    router.push(`/client-detail?id=${client.id}`);
  };

  const handleClientEdit = (client: Client) => {
    // Navigation vers la page d'édition
    router.push(`/client-edit?id=${client.id}`);
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.button} onPress={handleSignOut}>
          <Text style={styles.buttonText}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onClear={clearSearch}
        placeholder="Rechercher par nom, email, téléphone..."
        showResultCount={hasActiveSearch}
        resultCount={resultCount}
      />
      
      <ClientList
        clients={filteredClients}
        loading={loading}
        onRefresh={handleRefresh}
        onClientPress={handleClientPress}
        onClientEdit={handleClientEdit}
        variant="detailed"
        showActions={true}
        emptyMessage={
          hasActiveSearch 
            ? `Aucun client trouvé pour "${searchQuery}"` 
            : "Aucun client trouvé dans votre liste"
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});