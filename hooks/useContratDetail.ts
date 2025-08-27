import { useAuth } from '@/context/AuthContext';
import { contratsApi, type ContratDetail } from '@/services/contratsApi';
import { useCallback, useEffect, useState } from 'react';

export function useContratDetail(id: number | null) {
  const [contrat, setContrat] = useState<ContratDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token, signOut } = useAuth();

  const fetchContratDetail = useCallback(async () => {
    if (!token || !id) {
      setError("Non authentifié ou ID manquant");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const data = await contratsApi.getContratById(id, token);
      setContrat(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la récupération du contrat";
      setError(message);
      
      // Si erreur d'authentification, déconnecter automatiquement
      if (message.includes("Session expirée") || message.includes("401")) {
        await signOut();
      }
    } finally {
      setLoading(false);
    }
  }, [token, signOut, id]);

  useEffect(() => {
    if (token && id) {
      fetchContratDetail();
    }
  }, [token, id, fetchContratDetail]);

  return {
    contrat,
    loading,
    error,
    fetchContratDetail,
  };
}
