import { useAuth } from '@/context/AuthContext';
import { materielsApi, type Materiel } from '@/services/materielsApi';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';

export function useMateriels() {
  const [materiels, setMateriels] = useState<Materiel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token, signOut } = useAuth();
  const router = useRouter();

  const handleAuthError = useCallback(async () => {
    console.log('Erreur d\'authentification détectée, redirection vers login...');
    await signOut();
    router.replace('/login');
  }, [signOut, router]);

  const fetchMateriels = useCallback(async () => {
    if (!token) {
      setError("Non authentifié");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await materielsApi.getAllMateriels(token, handleAuthError);
      setMateriels(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la récupération des matériels";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [token, handleAuthError]);

  const createMateriel = useCallback(async (materielData: Omit<Materiel, 'id'>) => {
    if (!token) {
      throw new Error("Non authentifié");
    }
    
    try {
      const newMateriel = await materielsApi.createMateriel(materielData, token, handleAuthError);
      setMateriels(prev => [...prev, newMateriel]);
      return newMateriel;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la création du matériel";
      throw err;
    }
  }, [token, handleAuthError]);

  const updateMateriel = useCallback(async (id: number, materielData: Partial<Materiel>) => {
    if (!token) {
      throw new Error("Non authentifié");
    }
    
    try {
      const updatedMateriel = await materielsApi.updateMateriel(id, materielData, token, handleAuthError);
      setMateriels(prev => prev.map(m => m.id === id ? updatedMateriel : m));
      return updatedMateriel;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la mise à jour du matériel";
      throw err;
    }
  }, [token, handleAuthError]);

  const deleteMateriel = useCallback(async (id: number) => {
    if (!token) {
      throw new Error("Non authentifié");
    }
    
    try {
      await materielsApi.deleteMateriel(id, token, handleAuthError);
      setMateriels(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la suppression du matériel";
      throw err;
    }
  }, [token, handleAuthError]);

  useEffect(() => {
    if (token) {
      fetchMateriels();
    }
  }, [token, fetchMateriels]);

  return {
    materiels,
    loading,
    error,
    fetchMateriels,
    createMateriel,
    updateMateriel,
    deleteMateriel,
  };
}
