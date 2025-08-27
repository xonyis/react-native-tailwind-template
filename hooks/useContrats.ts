import { useAuth } from '@/context/AuthContext';
import { contratsApi, type Contrat } from '@/services/contratsApi';
import { useCallback, useEffect, useState } from 'react';

// Fonction pour nettoyer les données contrat
const cleanContratData = (contrat: any): Contrat => {
  return {
    id: contrat.id || 0,
    date_signature: contrat.date_signature || null,
    date_expiration: contrat.date_expiration || null,
    type_contrat: contrat.type_contrat || '',
    statut: contrat.statut || '',
    client: contrat.client || null,
  };
};

export function useContrats() {
  const [contrats, setContrats] = useState<Contrat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token, signOut } = useAuth();

  const fetchContrats = useCallback(async () => {
    if (!token) {
      setError("Non authentifié");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const data = await contratsApi.getAllContrats(token);
      
      // Nettoyer les données pour éviter les valeurs null
      const cleanedData = Array.isArray(data) 
        ? data.map(cleanContratData)
        : [];
        
      setContrats(cleanedData);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la récupération des contrats";
      setError(message);
      
      // Si erreur d'authentification, déconnecter automatiquement
      if (message.includes("Session expirée") || message.includes("401")) {
        await signOut();
      }
    } finally {
      setLoading(false);
    }
  }, [token, signOut]);

  const createContrat = useCallback(async (contratData: Omit<Contrat, 'id'>) => {
    if (!token) {
      throw new Error("Non authentifié");
    }

    try {
      const newContrat = await contratsApi.createContrat(contratData, token);
      const cleanedContrat = cleanContratData(newContrat);
      setContrats(prev => [...prev, cleanedContrat]);
      return cleanedContrat;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la création du contrat";
      throw new Error(message);
    }
  }, [token]);

  const updateContrat = useCallback(async (id: number, contratData: Partial<Contrat>) => {
    if (!token) {
      throw new Error("Non authentifié");
    }

    try {
      const updatedContrat = await contratsApi.updateContrat(id, contratData, token);
      const cleanedContrat = cleanContratData(updatedContrat);
      setContrats(prev => prev.map(contrat => 
        contrat.id === id ? cleanedContrat : contrat
      ));
      return cleanedContrat;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la mise à jour du contrat";
      throw new Error(message);
    }
  }, [token]);

  const deleteContrat = useCallback(async (id: number) => {
    if (!token) {
      throw new Error("Non authentifié");
    }

    try {
      await contratsApi.deleteContrat(id, token);
      setContrats(prev => prev.filter(contrat => contrat.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la suppression du contrat";
      throw new Error(message);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchContrats();
    }
  }, [token, fetchContrats]);

  return {
    contrats,
    loading,
    error,
    fetchContrats,
    createContrat,
    updateContrat,
    deleteContrat,
  };
}
