import { useAuth } from '@/context/AuthContext';
import { materielsApi, type MaterielDetail } from '@/services/materielsApi';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';

export function useMaterielDetail(materielId: number | null) {
  const [materiel, setMateriel] = useState<MaterielDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token, signOut } = useAuth();
  const router = useRouter();

  const handleAuthError = useCallback(async () => {
    console.log('Erreur d\'authentification détectée, redirection vers login...');
    await signOut();
    router.replace('/login');
  }, [signOut, router]);

  const fetchMateriel = useCallback(async () => {
    if (!token || !materielId) {
      setError("Non authentifié ou ID manquant");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await materielsApi.getMaterielById(materielId, token, handleAuthError);
      setMateriel(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la récupération du matériel";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [token, materielId, handleAuthError]);

  useEffect(() => {
    if (token && materielId) {
      fetchMateriel();
    }
  }, [token, materielId, fetchMateriel]);

  return {
    materiel,
    loading,
    error,
    fetchMateriel,
  };
}
