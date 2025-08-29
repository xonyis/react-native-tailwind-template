import { SearchBar } from '@/components/clients/SearchBar';
import { MaterielList } from '@/components/materiels/MaterielList';
import { useMaterielSearch } from '@/hooks/useMaterielSearch';
import { useMateriels } from '@/hooks/useMateriels';
import { type Materiel } from '@/services/materielsApi';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

export function MaterielsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const { materiels, loading, error, fetchMateriels } = useMateriels();
  const filteredMateriels = useMaterielSearch(materiels, searchQuery);

  const handleMaterielPress = (materiel: Materiel) => {
    router.push({
      pathname: '/(drawer)/materiel-detail',
      params: { id: materiel.id.toString() }
    });
  };

  const handleMaterielEdit = (materiel: Materiel) => {
    router.push({
      pathname: '/(drawer)/materiel-edit',
      params: { id: materiel.id.toString() }
    });
  };

  const handleRefresh = () => {
    fetchMateriels();
  };

  if (loading && materiels.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onClear={() => setSearchQuery('')}
        placeholder="Rechercher un matériel..."
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            colors={['#2563eb']}
          />
        }
      >
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        {filteredMateriels.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery ? 'Aucun matériel trouvé' : 'Aucun matériel disponible'}
            </Text>
          </View>
        ) : (
          <MaterielList
            materiels={filteredMateriels}
            onMaterielPress={handleMaterielPress}
            onMaterielEdit={handleMaterielEdit}
            variant="detailed"
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 16,
    textAlign: 'center',
  },
});
