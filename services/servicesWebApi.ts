import { makeAuthenticatedRequest } from './authApi';

export interface Hebergement {
  id: number;
  client_id?: number;
  client_nom?: string;
  client?: {
    id: number;
    nom: string;
    ville?: string;
    adresseEmail1?: string;
    adresseEmail2?: string;
    adresseClient?: string;
    codePostal?: string;
    pays?: string;
    numeroTel1?: string;
    numeroTel2?: string;
    referenceClient?: string;
    typeClient?: string;
    visiteAnnuelle?: string;
    commentaire?: string;
  } | null;
  date_renouvellement?: string; // Format: Y-m-d
  date_rappel?: string; // Format: Y-m-d
  derniere_facture?: string;
  type_hebergement?: string;
  is_nom_domaine: boolean;
  url?: string;
  date_creation?: string; // Format: Y-m-d H:i:s
  // Alias pour compatibilité
  dateRenouvellement?: string;
  dateRappel?: string;
  derniereFacture?: string;
  typeHebergement?: string;
  isNomDomaine: boolean;
  dateCreation?: string;
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
  client_id?: number;
  client_nom?: string;
  client?: {
    id: number;
    nom: string;
    ville?: string;
    adresseEmail1?: string;
    adresseEmail2?: string;
    adresseClient?: string;
    codePostal?: string;
    pays?: string;
    numeroTel1?: string;
    numeroTel2?: string;
    referenceClient?: string;
    typeClient?: string;
    visiteAnnuelle?: string;
    commentaire?: string;
  } | null;
  adresse_mail?: string;
  type_email?: string;
  serveur?: string;
  mot_de_passe?: string;
  date_de_renouvellement?: string; // Format: Y-m-d
  date_rappel?: string; // Format: Y-m-d
  derniere_facture?: string;
  // Alias pour compatibilité
  adresseMail?: string;
  typeEmail?: string;
  motDePasse?: string;
  dateDeRenouvellement?: string;
  dateRappel?: string;
  derniereFacture?: string;
}

export interface EmailDetail {
  id: number;
  client?: {
    id: number;
    nom: string;
    ville?: string;
    adresseEmail1?: string;
    adresseEmail2?: string;
    adresseClient?: string;
    codePostal?: string;
    pays?: string;
    numeroTel1?: string;
    numeroTel2?: string;
    referenceClient?: string;
    typeClient?: string;
    visiteAnnuelle?: string;
    commentaire?: string;
  } | null;
  adresse_mail?: string;
  type_email?: string;
  serveur?: string;
  mot_de_passe?: string;
  date_de_renouvellement?: string;
  date_rappel?: string;
  derniere_facture?: string;
  // Alias pour compatibilité
  adresseMail?: string;
  typeEmail?: string;
  motDePasse?: string;
  dateDeRenouvellement?: string;
  dateRappel?: string;
  derniereFacture?: string;
}

export interface Visite {
  id: number;
  client_id: number;
  client_nom: string;
  date_visite: string; // Format: d/m/Y
  date_programmee?: string; // Format: d/m/Y
  statut: string; // programmee, effectuee, annulee
  type_visite?: string; // annuelle, ponctuelle, maintenance
  technicien?: string;
  commentaires?: string;
  // Alias pour compatibilité avec l'ancien format
  client?: {
    id: number;
    nom: string;
    ville?: string;
    adresseClient?: string;
    codePostal?: string;
    pays?: string;
    numeroTel1?: string;
    numeroTel2?: string;
    referenceClient?: string;
    typeClient?: string;
    visiteAnnuelle?: string;
    commentaire?: string;
  } | null;
  dateVisite?: string;
  dateProgrammee?: string;
  typeVisite?: string;
  dateCreation?: string;
}

export interface VisiteDetail {
  id: number;
  client_id: number;
  client_nom: string;
  date_visite: string; // Format: d/m/Y
  date_programmee?: string; // Format: d/m/Y
  statut: string; // programmee, effectuee, annulee
  type_visite?: string; // annuelle, ponctuelle, maintenance
  technicien?: string;
  commentaires?: string;
  // Alias pour compatibilité avec l'ancien format
  client?: {
    id: number;
    nom: string;
    ville?: string;
    adresseClient?: string;
    codePostal?: string;
    pays?: string;
    numeroTel1?: string;
    numeroTel2?: string;
    referenceClient?: string;
    typeClient?: string;
    visiteAnnuelle?: string;
    commentaire?: string;
  } | null;
  dateVisite?: string;
  dateProgrammee?: string;
  typeVisite?: string;
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

  // === VISITES ===
  
  // Récupérer toutes les visites
  async getVisites(token: string, onAuthError?: () => void): Promise<Visite[]> {
    console.log('🔍 getVisites: Début de l\'appel API');
    const response = await makeAuthenticatedRequest('/api/visites', token, {}, onAuthError);
    console.log('🔍 getVisites: Réponse reçue:', response);
    console.log('🔍 getVisites: Type de response:', typeof response);
    console.log('🔍 getVisites: response.data:', response.data);
    console.log('🔍 getVisites: response est un array?', Array.isArray(response));
    
    // Si response.data existe, l'utiliser, sinon utiliser response directement
    const result = response.data || response || [];
    console.log('🔍 getVisites: Résultat final:', result);
    console.log('🔍 getVisites: Nombre d\'éléments:', result.length);
    return result;
  },

  // Récupérer les visites programmées
  async getVisitesProgrammees(token: string, onAuthError?: () => void): Promise<Visite[]> {
    const response = await makeAuthenticatedRequest('/api/visites/programmees', token, {}, onAuthError);
    console.log('🔍 getVisites: Réponse reçue:', response);
    console.log('🔍 getVisites: Type de response:', typeof response);
    console.log('🔍 getVisites: response.data:', response.data);
    console.log('🔍 getVisites: response est un array?', Array.isArray(response));
    
    // Si response.data existe, l'utiliser, sinon utiliser response directement
    const result = response.data || response || [];
    console.log('🔍 getVisites: Résultat final:', result);
    console.log('🔍 getVisites: Nombre d\'éléments:', result.length);
    return result;
  },

  // Récupérer les clients sans visite
  async getClientsSansVisite(token: string, onAuthError?: () => void): Promise<any[]> {
    const response = await makeAuthenticatedRequest('/api/clients/sans-visite', token, {}, onAuthError);
    return response.data || [];
  },

  // Récupérer une visite spécifique par ID
  async getVisiteById(id: number, token: string, onAuthError?: () => void): Promise<VisiteDetail> {
    const response = await makeAuthenticatedRequest(`/api/visites/${id}`, token, {}, onAuthError);
    return response;
  },

  // Créer une nouvelle visite
  async createVisite(visiteData: any, token: string, onAuthError?: () => void): Promise<Visite> {
    const response = await makeAuthenticatedRequest('/api/visites', token, {
      method: 'POST',
      body: JSON.stringify(visiteData),
    }, onAuthError);
    return response;
  },

  // Mettre à jour une visite
  async updateVisite(id: number, visiteData: any, token: string, onAuthError?: () => void): Promise<Visite> {
    const response = await makeAuthenticatedRequest(`/api/visites/${id}`, token, {
      method: 'PUT',
      body: JSON.stringify(visiteData),
    }, onAuthError);
    return response;
  },

  // Supprimer une visite
  async deleteVisite(id: number, token: string, onAuthError?: () => void): Promise<void> {
    await makeAuthenticatedRequest(`/api/visites/${id}`, token, {
      method: 'DELETE',
    }, onAuthError);
  },
};
