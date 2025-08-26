import { useAuth } from '@/context/AuthContext';
import { clientsApi, type Client } from '@/services/ClientsApi';
import { useCallback, useEffect, useState } from 'react';

// Fonction pour nettoyer les données client
const cleanClientData = (client: any): Client => {
  return {
    id: client.id || 0,
    nom: client.nom || '',
    email: client.email || '',
    telephone: client.telephone || '',
    raisonSocial: client.raisonSocial || '',
    adresseClient: client.adresseClient || '',
    ville: client.ville || '',
    codePostal: client.codePostal || '',
    numeroTel1: client.numeroTel1 || '',
    numeroTel2: client.numeroTel2 || '',
    siret: client.siret || '',
    typeClient: client.typeClient || '',
    latitude: client.latitude || null,
    longitude: client.longitude || null,
    referenceClient: client.referenceClient || null,
    visiteAnnuelle: client.visiteAnnuelle || null,
  };
};

export function useClients() {
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
      
      // Nettoyer les données pour éviter les valeurs null
      const cleanedData = Array.isArray(data) 
        ? data.map(cleanClientData)
        : [];
        
      setClients(cleanedData);
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

  const createClient = useCallback(async (clientData: Omit<Client, 'id'>) => {
    if (!token) {
      throw new Error("Non authentifié");
    }

    try {
      const newClient = await clientsApi.createClient(clientData, token);
      const cleanedClient = cleanClientData(newClient);
      setClients(prev => [...prev, cleanedClient]);
      return cleanedClient;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la création du client";
      throw new Error(message);
    }
  }, [token]);

  const updateClient = useCallback(async (id: number, clientData: Partial<Client>) => {
    if (!token) {
      throw new Error("Non authentifié");
    }

    try {
      const updatedClient = await clientsApi.updateClient(id, clientData, token);
      const cleanedClient = cleanClientData(updatedClient);
      setClients(prev => prev.map(client => 
        client.id === id ? cleanedClient : client
      ));
      return cleanedClient;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la mise à jour du client";
      throw new Error(message);
    }
  }, [token]);

  const deleteClient = useCallback(async (id: number) => {
    if (!token) {
      throw new Error("Non authentifié");
    }

    try {
      await clientsApi.deleteClient(id, token);
      setClients(prev => prev.filter(client => client.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la suppression du client";
      throw new Error(message);
    }
  }, [token]);

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
    createClient,
    updateClient,
    deleteClient,
  };
}