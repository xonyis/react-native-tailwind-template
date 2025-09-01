import { useAuth } from "@/context/AuthContext";
import { Hebergement, servicesWebApi } from "@/services/servicesWebApi";
import { useEffect, useState } from "react";

export function useHebergements() {
  const { token, handleAuthError } = useAuth();
  const [hebergements, setHebergements] = useState<Hebergement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Token d'authentification manquant");
      setLoading(false);
      return;
    }

    const fetchHebergements = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await servicesWebApi.getHebergements(token, handleAuthError);
        setHebergements(data);
      } catch (err) {
        console.error('Erreur lors du chargement des hébergements:', err);
        setError(err instanceof Error ? err.message : "Erreur lors du chargement des hébergements");
      } finally {
        setLoading(false);
      }
    };

    fetchHebergements();
  }, [token, handleAuthError]);

  const refreshHebergements = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await servicesWebApi.getHebergements(token, handleAuthError);
      setHebergements(data);
    } catch (err) {
      console.error('Erreur lors du rafraîchissement des hébergements:', err);
      setError(err instanceof Error ? err.message : "Erreur lors du rafraîchissement des hébergements");
    } finally {
      setLoading(false);
    }
  };

  return {
    hebergements,
    loading,
    error,
    refreshHebergements,
  };
}
