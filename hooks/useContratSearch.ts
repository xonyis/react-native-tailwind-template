import { Contrat } from '@/services/contratsApi';
import { useMemo, useState } from 'react';

export function useContratSearch(contrats: Contrat[]) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContrats = useMemo(() => {
    if (!searchQuery.trim()) {
      return contrats;
    }

    const query = searchQuery.toLowerCase().trim();
    
    return contrats.filter(contrat => {
      // Recherche par type de contrat
      if (contrat.type_contrat?.toLowerCase().includes(query)) {
        return true;
      }
      
      // Recherche par statut
      if (contrat.statut?.toLowerCase().includes(query)) {
        return true;
      }
      
      // Recherche par nom du client
      if (contrat.client?.toLowerCase().includes(query)) {
        return true;
      }
      
      // Recherche par date de signature
      if (contrat.date_signature?.includes(query)) {
        return true;
      }
      
      // Recherche par date d'expiration
      if (contrat.date_expiration?.includes(query)) {
        return true;
      }
      
      return false;
    });
  }, [contrats, searchQuery]);

  const clearSearch = () => {
    setSearchQuery('');
  };

  const hasActiveSearch = searchQuery.trim().length > 0;
  const resultCount = filteredContrats.length;

  return {
    searchQuery,
    setSearchQuery,
    filteredContrats,
    clearSearch,
    hasActiveSearch,
    resultCount,
  };
}
