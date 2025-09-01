import { makeAuthenticatedRequest } from './authApi';

export interface Hebergement {
  id: number;
  client?: {
    id: number;
    nom: string;
    raisonSocial?: string;
    adresseEmailClient?: string;
    numeroTel1?: string;
  } | null;
  dateRenouvellement?: string; // Format: Y-m-d
  dateRappel?: string; // Format: Y-m-d
  derniereFacture?: string;
  typeHebergement: string;
  isNomDomaine: boolean;
  url: string;
  dateCreation?: string; // Format: Y-m-d H:i:s
}

export interface Site {
  id: number;
  client?: {
    id: number;
    nom: string;
    raisonSocial?: string;
    adresseEmailClient?: string;
    numeroTel1?: string;
  } | null;
  url: string;
  urlAdmin?: string;
  login?: string;
  passwordDechiffre?: string;
  dateCreation?: string; // Y-m-d H:i:s
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

export const servicesWebApi = {
  // Récupérer tous les hébergements
  async getHebergements(token: string, onAuthError?: () => void): Promise<Hebergement[]> {
    const response = await makeAuthenticatedRequest('/api/hebergements', token, {}, onAuthError);
    return response.data || [];
  },

  // Récupérer un hébergement spécifique par ID
  async getHebergementById(id: number, token: string, onAuthError?: () => void): Promise<Hebergement> {
    const response = await makeAuthenticatedRequest(`/api/hebergements/${id}`, token, {}, onAuthError);
    return response;
  },

  // Mettre à jour un hébergement
  async updateHebergement(id: number, data: Partial<Hebergement>, token: string, onAuthError?: () => void): Promise<Hebergement> {
    const response = await makeAuthenticatedRequest(`/api/hebergements/${id}`, token, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, onAuthError);
    return response.hebergement;
  },

  async deleteHebergement(id: number, token: string, onAuthError?: () => void): Promise<void> {
    await makeAuthenticatedRequest(`/api/hebergements/${id}`, token, {
      method: 'DELETE',
    }, onAuthError);
  },

  async createHebergement(data: Partial<Hebergement>, token: string, onAuthError?: () => void): Promise<Hebergement> {
    const response = await makeAuthenticatedRequest(`/api/hebergements`, token, {
      method: 'POST',
      body: JSON.stringify(data),
    }, onAuthError);
    return response.hebergement;
  },

  // Récupérer tous les clients
  async getClients(token: string, onAuthError?: () => void): Promise<any[]> {
    const response = await makeAuthenticatedRequest(`/api/clients`, token, {}, onAuthError);
    return response;
  },

  // Récupérer tous les sites
  async getSites(token: string, onAuthError?: () => void): Promise<Site[]> {
    const response = await makeAuthenticatedRequest('/api/sites', token, {}, onAuthError);
    return response.data || [];
  },

  // Récupérer un site spécifique par ID
  async getSiteById(id: number, token: string, onAuthError?: () => void): Promise<Site> {
  const response = await makeAuthenticatedRequest(`/api/sites/${id}`, token, {}, onAuthError);
  return response;
},

async updateSite(id: number, data: Partial<Site>, token: string, onAuthError?: () => void): Promise<Site> {
  const response = await makeAuthenticatedRequest(`/api/sites/${id}`, token, {
    method: 'PUT',
    body: JSON.stringify(data),
  }, onAuthError);
  return response.site;
},

async deleteSite(id: number, token: string, onAuthError?: () => void): Promise<void> {
  await makeAuthenticatedRequest(`/api/sites/${id}`, token, {
    method: 'DELETE',
  }, onAuthError);
},

async createSite(data: Partial<Site>, token: string, onAuthError?: () => void): Promise<Site> {
  const response = await makeAuthenticatedRequest(`/api/sites`, token, {
    method: 'POST',
    body: JSON.stringify(data),
  }, onAuthError);
  return response.site;
},

  // Récupérer tous les emails
  async getEmails(token: string, onAuthError?: () => void): Promise<Email[]> {
    const response = await makeAuthenticatedRequest('/api/emails', token, {}, onAuthError);
    return response.data || [];
  },

  // Récupérer un email spécifique par ID
  async getEmailById(id: number, token: string, onAuthError?: () => void): Promise<EmailDetail> {
    const response = await makeAuthenticatedRequest(`/api/emails/${id}`, token, {}, onAuthError);
    return response;
  },

  // Supprimer un email
  async deleteEmail(id: number, token: string, onAuthError?: () => void): Promise<void> {
    await makeAuthenticatedRequest(`/api/emails/${id}`, token, {
      method: 'DELETE',
    }, onAuthError);
  },

  // Mettre à jour un email
  async updateEmail(id: number, data: Partial<EmailDetail>, token: string, onAuthError?: () => void): Promise<EmailDetail> {
    const response = await makeAuthenticatedRequest(`/api/emails/${id}`, token, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, onAuthError);
    return response.email;
  },

  // Créer un email
  async createEmail(data: Partial<EmailDetail> & { clientId: number }, token: string, onAuthError?: () => void): Promise<EmailDetail> {
    const response = await makeAuthenticatedRequest('/api/emails', token, {
      method: 'POST',
      body: JSON.stringify(data),
    }, onAuthError);
    return response.email;
  },
};
