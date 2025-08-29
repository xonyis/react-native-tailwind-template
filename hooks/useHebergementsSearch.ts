import { Hebergement } from '@/services/servicesWebApi';
import { useMemo } from 'react';

export function useHebergementsSearch(hebergements: Hebergement[], searchQuery: string) {
  const filteredHebergements = useMemo(() => {
    if (!searchQuery.trim()) {
      return hebergements;
    }

    const query = searchQuery.toLowerCase();
    
    return hebergements.filter(hebergement => 
      (hebergement.url?.toLowerCase() || '').includes(query) ||
      (hebergement.client_nom?.toLowerCase() || '').includes(query) ||
      (hebergement.type_hebergement?.toLowerCase() || '').includes(query) ||
      (hebergement.derniere_facture?.toLowerCase() || '').includes(query)
    );
  }, [hebergements, searchQuery]);

  return filteredHebergements;
}
