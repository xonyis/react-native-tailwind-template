import { useAuth } from '@/context/AuthContext';
import { servicesWebApi } from '@/services/servicesWebApi';
import { useCallback, useEffect, useState } from 'react';

export interface EmailDetail {
  id: number;
  client?: {
    id: number;
    nom: string;
    raisonSocial?: string;
    adresseEmailClient?: string;
    numeroTel1?: string;
  } | null;
  adresseMail: string;
  typeEmail: string;
  motDePasseDechiffre: string;
  dateDeRenouvellement?: string;
  dateRappel?: string;
  derniereFacture?: string;
  dateCreation?: string;
}

export function useEmailDetail(id: number | null) {
  const [email, setEmail] = useState<EmailDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token, signOut } = useAuth();

  const fetchEmailDetail = useCallback(async () => {
    if (!token || !id) {
      setError("Non authentifié ou ID manquant");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const data = await servicesWebApi.getEmailById(id, token);
      setEmail(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la récupération de l'email";
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
      fetchEmailDetail();
    }
  }, [token, id, fetchEmailDetail]);

  return {
    email,
    loading,
    error,
    fetchEmailDetail,
  };
}
