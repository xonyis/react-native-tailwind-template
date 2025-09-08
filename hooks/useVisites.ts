import { useAuth } from '@/context/AuthContext';
import { servicesWebApi, Visite } from '@/services/servicesWebApi';
import { useEffect, useState } from 'react';

export const useVisites = () => {
  const { token } = useAuth();
  const [visites, setVisites] = useState<Visite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVisites = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await servicesWebApi.getVisites(token);
      setVisites(data);
    } catch (err) {
      console.error('Erreur lors du chargement des visites:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisites();
  }, [token]);

  return {
    visites,
    loading,
    error,
    refreshVisites: fetchVisites,
  };
};
