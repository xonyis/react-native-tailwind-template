import { useAuth } from "@/context/AuthContext";
import { servicesWebApi, Site } from "@/services/servicesWebApi";
import { useEffect, useState } from "react";

export function useSites() {
  const { token, handleAuthError } = useAuth();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Token d'authentification manquant");
      setLoading(false);
      return;
    }

    const fetchSites = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await servicesWebApi.getSites(token, handleAuthError);
        setSites(data);
      } catch (err) {
        console.error('Erreur lors du chargement des sites:', err);
        setError(err instanceof Error ? err.message : "Erreur lors du chargement des sites");
      } finally {
        setLoading(false);
      }
    };

    fetchSites();
  }, [token, handleAuthError]);

  const refreshSites = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await servicesWebApi.getSites(token, handleAuthError);
      setSites(data);
    } catch (err) {
      console.error('Erreur lors du rafraîchissement des sites:', err);
      setError(err instanceof Error ? err.message : "Erreur lors du rafraîchissement des sites");
    } finally {
      setLoading(false);
    }
  };

  return {
    sites,
    loading,
    error,
    refreshSites,
  };
}
