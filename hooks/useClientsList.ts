import { useAuth } from '@/context/AuthContext';
import { clientsApi, type Client } from '@/services/ClientsApi';
import { useCallback, useEffect, useState } from 'react';

export function useClientsList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token, signOut } = useAuth();

  const fetchClients = useCallback(async () => {
    if (!token) {
      setError("Non authentifié");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const data = await clientsApi.getAllClients(token);
      setClients(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la récupération des clients";
      setError(message);
      
      // Si erreur d'authentification, déconnecter automatiquement
      if (message.includes("Session expirée") || message.includes("401")) {
        await signOut();
      }
    } finally {
      setLoading(false);
    }
  }, [token, signOut]);

  useEffect(() => {
    if (token) {
      fetchClients();
    }
  }, [token, fetchClients]);

  return {
    clients,
    loading,
    error,
    fetchClients,
  };
}
