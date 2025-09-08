import { useAuth } from '@/context/AuthContext';
import { servicesWebApi, VisiteDetail } from '@/services/servicesWebApi';
import { useEffect, useState } from 'react';

export const useVisiteDetail = (id: number | null) => {
  const { token } = useAuth();
  const [visite, setVisite] = useState<VisiteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !token) {
      setLoading(false);
      return;
    }

    const fetchVisite = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await servicesWebApi.getVisiteById(id, token);
        setVisite(data);
      } catch (err) {
        console.error('Erreur lors du chargement de la visite:', err);
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchVisite();
  }, [id, token]);

  return {
    visite,
    loading,
    error,
  };
};
