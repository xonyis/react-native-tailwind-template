import { makeAuthenticatedRequest } from './authApi';

export interface Hebergement {
  id: number;
  client_nom: string;
  client_id: number;
  url: string;
  type_hebergement: string;
  date_renouvellement: string;
  date_rappel: string;
  derniere_facture: string;
  is_nom_domaine: boolean;
  date_creation: string;
}

export interface Site {
  id: number;
  client_nom: string;
  client_id: number;
  url: string;
  url_admin: string;
  login: string;
  password: string;
  date_creation: string;
}

export interface Email {
  id: number;
  client_nom: string;
  adresse_email: string;
  type_email: string;
  serveur: string;
  mot_de_passe: string;
  date_renouvellement: string;
  date_rappel: string;
  derniere_facture: string;
}

export const servicesWebApi = {
  // Récupérer tous les hébergements
  async getHebergements(token: string, onAuthError?: () => void): Promise<Hebergement[]> {
    const response = await makeAuthenticatedRequest('/api/hebergements', token, {}, onAuthError);
    return response.data || [];
  },

  // Récupérer tous les sites
  async getSites(token: string, onAuthError?: () => void): Promise<Site[]> {
    const response = await makeAuthenticatedRequest('/api/sites', token, {}, onAuthError);
    return response.data || [];
  },

  // Récupérer tous les emails
  async getEmails(token: string, onAuthError?: () => void): Promise<Email[]> {
    const response = await makeAuthenticatedRequest('/api/emails', token, {}, onAuthError);
    return response.data || [];
  },
};
