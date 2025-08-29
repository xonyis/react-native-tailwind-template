import { useAuth } from '@/context/AuthContext';
import { nexleaseApi, type NexLease } from '@/services/nexleaseApi';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

export function useNexLeases() {
  const [nexleases, setNexLeases] = useState<NexLease[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token, signOut } = useAuth();
  const router = useRouter();

  const handleAuthError = useCallback(async () => {
    console.log('Erreur d\'authentification détectée, redirection vers login...');
    await signOut();
    router.replace('/login');
  }, [signOut, router]);

  const fetchNexLeases = useCallback(async () => {
    if (!token) {
      setError("Non authentifié");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await nexleaseApi.getAllNexLeases(token, handleAuthError);
      setNexLeases(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la récupération des NexLease";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [token, handleAuthError]);

  useEffect(() => {
    if (token) {
      fetchNexLeases();
    }
  }, [token, fetchNexLeases]);

  return {
    nexleases,
    loading,
    error,
    fetchNexLeases,
  };
}
