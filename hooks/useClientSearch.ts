import { Client } from '@/services/ClientsApi';
import { useMemo, useState } from 'react';

export function useClientSearch(clients: Client[]) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClients = useMemo(() => {
    if (!searchQuery.trim() || !Array.isArray(clients)) {
      return clients || [];
    }

    const query = searchQuery.toLowerCase().trim();
    return clients.filter((client) => {
      if (!client || typeof client !== 'object') {
        return false;
      }

      // Fonction helper pour vérifier les valeurs nulles/undefined
      const safeIncludes = (value: any, searchTerm: string): boolean => {
        if (!value || typeof value !== 'string') return false;
        try {
          return value.toLowerCase().includes(searchTerm);
        } catch {
          return false;
        }
      };

      // Recherche dans tous les champs texte
      return (
        safeIncludes(client.nom, query) ||
        safeIncludes(client.email, query) ||
        safeIncludes(client.telephone, query) ||
        safeIncludes(client.adresseClient, query) ||
        safeIncludes(client.ville, query) ||
        safeIncludes(client.codePostal, query) ||
        safeIncludes(client.raisonSocial, query) ||
        safeIncludes(client.numeroTel1, query) ||
        safeIncludes(client.numeroTel2, query) ||
        safeIncludes(client.siret, query) ||
        safeIncludes(client.typeClient, query) ||
        safeIncludes(client.referenceClient, query)
      );
    });
  }, [clients, searchQuery]);

  const clearSearch = () => {
    setSearchQuery('');
  };

  return {
    searchQuery,
    setSearchQuery,
    filteredClients,
    clearSearch,
    hasActiveSearch: searchQuery.trim().length > 0,
    resultCount: filteredClients.length,
  };
}