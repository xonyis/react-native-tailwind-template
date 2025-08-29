import { Email } from "@/services/servicesWebApi";
import { useMemo } from "react";

export function useEmailsSearch(emails: Email[], searchQuery: string) {
  const filteredEmails = useMemo(() => {
    if (!searchQuery.trim()) {
      return emails;
    }

    const query = searchQuery.toLowerCase();
    return emails.filter((email) => {
      return (
        email.adresse_email?.toLowerCase().includes(query) ||
        email.client_nom?.toLowerCase().includes(query) ||
        email.type_email?.toLowerCase().includes(query) ||
        email.serveur?.toLowerCase().includes(query) ||
        email.date_renouvellement?.toLowerCase().includes(query) ||
        email.derniere_facture?.toLowerCase().includes(query)
      );
    });
  }, [emails, searchQuery]);

  return filteredEmails;
}
