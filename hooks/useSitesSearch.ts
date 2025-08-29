import { Site } from '@/services/servicesWebApi';
import { useMemo } from 'react';

export function useSitesSearch(sites: Site[], searchQuery: string) {
  const filteredSites = useMemo(() => {
    if (!searchQuery.trim()) {
      return sites;
    }

    const query = searchQuery.toLowerCase();
    
    return sites.filter(site => 
      (site.url?.toLowerCase() || '').includes(query) ||
      (site.client_nom?.toLowerCase() || '').includes(query) ||
      (site.url_admin?.toLowerCase() || '').includes(query) ||
      (site.login?.toLowerCase() || '').includes(query)
    );
  }, [sites, searchQuery]);

  return filteredSites;
}
