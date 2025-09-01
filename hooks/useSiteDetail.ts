import { useAuth } from "@/context/AuthContext";
import { Site, servicesWebApi } from "@/services/servicesWebApi";
import { useEffect, useState } from "react";

export function useSiteDetail(siteId: number | null) {
  const { token, handleAuthError } = useAuth();
  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!siteId || !token) {
      setError("ID site ou token manquant");
      setLoading(false);
      return;
    }

    const fetchSiteDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const siteData = await servicesWebApi.getSiteById(siteId, token, handleAuthError);
        setSite(siteData);
      } catch (err) {
        console.error("Erreur lors du chargement des détails du site:", err);
        setError(err instanceof Error ? err.message : "Erreur lors du chargement des détails");
      } finally {
        setLoading(false);
      }
    };

    fetchSiteDetail();
  }, [siteId, token, handleAuthError]);

  const refreshSite = async () => {
    if (!siteId || !token) return;
    try {
      setLoading(true);
      setError(null);
      const siteData = await servicesWebApi.getSiteById(siteId, token, handleAuthError);
      setSite(siteData);
    } catch (err) {
      console.error("Erreur lors du rafraîchissement du site:", err);
      setError(err instanceof Error ? err.message : "Erreur lors du rafraîchissement");
    } finally {
      setLoading(false);
    }
  };

  return { site, loading, error, refreshSite };
}
