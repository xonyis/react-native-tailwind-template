import { useAuth } from '@/context/AuthContext';
import { servicesWebApi } from '@/services/servicesWebApi';
import { useEffect, useState } from 'react';

export const useClientsSansVisite = () => {
  const { token } = useAuth();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClientsSansVisite = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await servicesWebApi.getClientsSansVisite(token);
      setClients(data);
    } catch (err) {
      console.error('Erreur lors du chargement des clients sans visite:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientsSansVisite();
  }, [token]);

  return {
    clients,
    loading,
    error,
    refetch: fetchClientsSansVisite,
  };
};
