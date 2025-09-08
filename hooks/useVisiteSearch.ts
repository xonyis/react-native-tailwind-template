import { VisiteCategory } from '@/components/visites/VisitesTabs';
import { Visite } from '@/services/servicesWebApi';
import { useMemo } from 'react';

export const useVisiteSearch = (visites: Visite[], searchQuery: string, activeTab: VisiteCategory) => {
  const filteredVisites = useMemo(() => {
    let filtered = visites;

    // Filtrage par onglet
    if (activeTab === 'programmee') {
      // Afficher seulement les visites programmées
      filtered = filtered.filter(visite => visite.statut === 'programmee');
    } else if (activeTab === 'historique') {
      // Afficher toutes les visites (pas de filtrage par statut)
      // Les données viennent déjà de /api/visites qui contient toutes les visites
      filtered = visites;
    }

    // Filtrage par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(visite => {
        const clientName = (visite.client_nom || visite.client?.nom || '').toLowerCase();
        const technicien = (visite.technicien || '').toLowerCase();
        const commentaires = (visite.commentaires || '').toLowerCase();
        const typeVisite = (visite.type_visite || visite.typeVisite || '').toLowerCase();
        
        return (
          clientName.includes(query) ||
          technicien.includes(query) ||
          commentaires.includes(query) ||
          typeVisite.includes(query)
        );
      });
    }

    return filtered;
  }, [visites, searchQuery, activeTab]);

  return filteredVisites;
};
