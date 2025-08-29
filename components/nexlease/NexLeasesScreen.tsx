import { SearchBar } from '@/components/clients/SearchBar';
import { NexLeaseList } from '@/components/nexlease/NexLeaseList';
import { useNexLeaseSearch } from '@/hooks/useNexLeaseSearch';
import { useNexLeases } from '@/hooks/useNexLeases';
import { type NexLease } from '@/services/nexleaseApi';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

export function NexLeasesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const { nexleases, loading, error, fetchNexLeases } = useNexLeases();
  const filteredNexLeases = useNexLeaseSearch(nexleases, searchQuery);

  const handleNexLeasePress = (nexlease: NexLease) => {
    router.push({
      pathname: '/(drawer)/nexlease-detail',
      params: { id: nexlease.id.toString() }
    });
  };

  const handleNexLeaseEdit = (nexlease: NexLease) => {
    router.push({
      pathname: '/(drawer)/nexlease-edit',
      params: { id: nexlease.id.toString() }
    });
  };

  const handleRefresh = () => {
    fetchNexLeases();
  };

  if (loading && nexleases.length === 0) {
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
        placeholder="Rechercher un NexLease..."
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
        
        {filteredNexLeases.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery ? 'Aucun NexLease trouvé' : 'Aucun NexLease disponible'}
            </Text>
          </View>
        ) : (
          <NexLeaseList
            nexleases={filteredNexLeases}
            onNexLeasePress={handleNexLeasePress}
            onNexLeaseEdit={handleNexLeaseEdit}
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
    backgroundColor: '#fff',
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
