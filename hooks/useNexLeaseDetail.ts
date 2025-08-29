import { useAuth } from '@/context/AuthContext';
import { nexleaseApi, type NexLeaseDetail } from '@/services/nexleaseApi';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';

export function useNexLeaseDetail(nexleaseId: number | null) {
  const [nexlease, setNexLease] = useState<NexLeaseDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token, signOut } = useAuth();
  const router = useRouter();

  const handleAuthError = useCallback(async () => {
    console.log('Erreur d\'authentification détectée, redirection vers login...');
    await signOut();
    router.replace('/login');
  }, [signOut, router]);

  const fetchNexLease = useCallback(async () => {
    if (!token || !nexleaseId) {
      setError("Non authentifié ou ID manquant");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await nexleaseApi.getNexLeaseById(nexleaseId, token, handleAuthError);
      setNexLease(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la récupération du NexLease";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [token, nexleaseId, handleAuthError]);

  useEffect(() => {
    if (token && nexleaseId) {
      fetchNexLease();
    }
  }, [token, nexleaseId, fetchNexLease]);

  return {
    nexlease,
    loading,
    error,
    fetchNexLease,
  };
}
