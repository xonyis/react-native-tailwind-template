import { type Materiel } from '@/services/materielsApi';
import { useMemo } from 'react';

export function useMaterielSearch(materiels: Materiel[], searchQuery: string) {
  const filteredMateriels = useMemo(() => {
    if (!searchQuery.trim()) {
      return materiels;
    }

    const query = searchQuery.toLowerCase();
    
    return materiels.filter(materiel => 
      (materiel.nom?.toLowerCase() || '').includes(query) ||
      (materiel.reference?.toLowerCase() || '').includes(query) ||
      (materiel.type_materiel?.toLowerCase() || '').includes(query) ||
      (materiel.etat?.toLowerCase() || '').includes(query) ||
      (materiel.client?.toLowerCase() || '').includes(query) ||
      (materiel.quantite_total?.toString() || '').includes(query) ||
      (materiel.date_achat?.toLowerCase() || '').includes(query)
    );
  }, [materiels, searchQuery]);

  return filteredMateriels;
}
