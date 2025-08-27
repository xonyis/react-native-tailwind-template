import { useAuth } from '@/context/AuthContext';
import { useContrats } from '@/hooks/useContrats';
import { useContratSearch } from '@/hooks/useContratSearch';
import { Contrat } from '@/services/contratsApi';
import { useRouter } from 'expo-router';

import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SearchBar } from '../clients/SearchBar';
import { ContratList } from './ContratList';

export const ContratsScreen: React.FC = () => {
  const { contrats, loading, error, fetchContrats } = useContrats();
  const { signOut } = useAuth();
  const router = useRouter();
  
  const {
    searchQuery,
    setSearchQuery,
    filteredContrats,
    clearSearch,
    hasActiveSearch,
    resultCount,
  } = useContratSearch(contrats);

  const handleRefresh = () => {
    fetchContrats();
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch {
      Alert.alert('Erreur', 'Impossible de se déconnecter');
    }
  };

  const handleContratPress = (contrat: Contrat) => {
    // Navigation vers la page de détail
    router.push({
      pathname: '/(drawer)/contrat-detail',
      params: { id: contrat.id.toString() }
    });
  };

  const handleContratEdit = (contrat: Contrat) => {
    // Navigation vers la page d'édition
    router.push({
      pathname: '/(drawer)/contrat-edit',
      params: { id: contrat.id.toString() }
    });
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
        placeholder="Rechercher par type, statut, client..."
        showResultCount={hasActiveSearch}
        resultCount={resultCount}
      />
      
      <ContratList
        contrats={filteredContrats}
        loading={loading}
        onRefresh={handleRefresh}
        onContratPress={handleContratPress}
        onContratEdit={handleContratEdit}
        variant="detailed"
        showActions={true}
        emptyMessage={
          hasActiveSearch 
            ? `Aucun contrat trouvé pour "${searchQuery}"` 
            : "Aucun contrat trouvé dans votre liste"
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
