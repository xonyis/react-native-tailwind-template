import { ServiceWebItem } from '@/components/services-web/ServicesWebList';
import { useMemo } from 'react';

export function useServicesWebSearch(items: ServiceWebItem[], searchQuery: string) {
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return items;
    }

    const query = searchQuery.toLowerCase();
    
    return items.filter(item => 
      (item.nom?.toLowerCase() || '').includes(query) ||
      (item.reference?.toLowerCase() || '').includes(query) ||
      (item.client?.nom?.toLowerCase() || '').includes(query) ||
      (item.client?.referenceClient?.toLowerCase() || '').includes(query) ||
      (item.statut?.toLowerCase() || '').includes(query)
    );
  }, [items, searchQuery]);

  return filteredItems;
}
