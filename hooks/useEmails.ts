import { useAuth } from "@/context/AuthContext";
import { servicesWebApi, Email } from "@/services/servicesWebApi";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

export function useEmails() {
  const { token } = useAuth();
  const router = useRouter();
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleAuthError = () => {
    router.replace('/login');
  };

  useEffect(() => {
    if (!token) {
      setError("Token d'authentification manquant");
      setLoading(false);
      return;
    }

    const fetchEmails = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await servicesWebApi.getEmails(token, handleAuthError);
        setEmails(data);
      } catch (err) {
        console.error('Erreur lors du chargement des emails:', err);
        setError(err instanceof Error ? err.message : "Erreur lors du chargement des emails");
      } finally {
        setLoading(false);
      }
    };

    fetchEmails();
  }, [token]);

  const refreshEmails = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);
      const data = await servicesWebApi.getEmails(token, handleAuthError);
      setEmails(data);
    } catch (err) {
      console.error('Erreur lors du rafraîchissement des emails:', err);
      setError(err instanceof Error ? err.message : "Erreur lors du rafraîchissement des emails");
    } finally {
      setLoading(false);
    }
  };

  return {
    emails,
    loading,
    error,
    refreshEmails,
  };
}
