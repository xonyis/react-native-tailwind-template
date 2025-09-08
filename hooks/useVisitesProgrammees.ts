import { useAuth } from '@/context/AuthContext';
import { servicesWebApi, Visite } from '@/services/servicesWebApi';
import { useEffect, useState } from 'react';

export const useVisitesProgrammees = () => {
  const { token } = useAuth();
  const [visitesProgrammees, setVisitesProgrammees] = useState<Visite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVisitesProgrammees = async () => {
    if (!token) {
      console.log('useVisitesProgrammees: Pas de token disponible');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      console.log('useVisitesProgrammees: Début du chargement des visites programmées...');
      const data = await servicesWebApi.getVisitesProgrammees(token);
      console.log('useVisitesProgrammees: Données reçues:', data);
      console.log('useVisitesProgrammees: Nombre de visites programmées:', data?.length || 0);
      setVisitesProgrammees(data);
    } catch (err) {
      console.error('useVisitesProgrammees: Erreur lors du chargement des visites programmées:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitesProgrammees();
  }, [token]);

  return {
    visitesProgrammees,
    loading,
    error,
    refreshVisitesProgrammees: fetchVisitesProgrammees,
  };
};