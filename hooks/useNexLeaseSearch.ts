import { type NexLease } from '@/services/nexleaseApi';
import { useMemo } from 'react';

export function useNexLeaseSearch(nexleases: NexLease[], searchQuery: string) {
  const filteredNexLeases = useMemo(() => {
    if (!searchQuery.trim()) {
      return nexleases;
    }

    const query = searchQuery.toLowerCase();
    
    return nexleases.filter(nexlease => 
      (nexlease.client?.nom?.toLowerCase() || '').includes(query) ||
      (nexlease.client?.raisonSocial?.toLowerCase() || '').includes(query) ||
      (nexlease.duree?.toString()?.toLowerCase() || '').includes(query) ||
      (nexlease.biensFinances?.toLowerCase() || '').includes(query) ||
      (nexlease.dateDebut?.toLowerCase() || '').includes(query) ||
      (nexlease.dateFin?.toLowerCase() || '').includes(query) ||
      (nexlease.dateRelance1?.toLowerCase() || '').includes(query) ||
      (nexlease.dateRelance2?.toLowerCase() || '').includes(query)
    );
  }, [nexleases, searchQuery]);

  return filteredNexLeases;
}
