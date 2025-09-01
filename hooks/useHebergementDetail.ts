import { useAuth } from "@/context/AuthContext";
import { Hebergement, servicesWebApi } from "@/services/servicesWebApi";
import { useEffect, useState } from "react";

export function useHebergementDetail(hebergementId: number | null) {
  const { token, handleAuthError } = useAuth();
  const [hebergement, setHebergement] = useState<Hebergement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hebergementId || !token) {
      setError("ID hébergement ou token manquant");
      setLoading(false);
      return;
    }

    const fetchHebergementDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const hebergementData = await servicesWebApi.getHebergementById(hebergementId, token, handleAuthError);
        setHebergement(hebergementData);
      } catch (err) {
        console.error('Erreur lors du chargement des détails de l\'hébergement:', err);
        setError(err instanceof Error ? err.message : "Erreur lors du chargement des détails");
      } finally {
        setLoading(false);
      }
    };

    fetchHebergementDetail();
  }, [hebergementId, token, handleAuthError]);

  const refreshHebergement = async () => {
    if (!hebergementId || !token) return;

    try {
      setLoading(true);
      setError(null);
      const hebergementData = await servicesWebApi.getHebergementById(hebergementId, token, handleAuthError);
      setHebergement(hebergementData);
    } catch (err) {
      console.error('Erreur lors du rafraîchissement des détails de l\'hébergement:', err);
      setError(err instanceof Error ? err.message : "Erreur lors du rafraîchissement des détails");
    } finally {
      setLoading(false);
    }
  };

  return {
    hebergement,
    loading,
    error,
    refreshHebergement,
  };
}
