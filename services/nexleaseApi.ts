import { makeAuthenticatedRequest } from './authApi';

export interface ClientDetails {
  id: number;
  nom: string;
  email: string;
  telephone: string;
  referenceClient: string;
  raisonSocial: string;
  adresseClient: string;
  ville: string;
  codePostal: string;
  pays: string;
}

export interface NexLease {
  id: number;
  client: ClientDetails;
  dateDebut: string;
  dateFin: string;
  duree: number;
  dateRelance1: string;
  dateRelance2: string;
  biensFinances: string;
}

export interface NexLeaseDetail extends Omit<NexLease, 'client'> {
  client: ClientDetails | null;
}

export const nexleaseApi = {
  // Récupérer tous les NexLease
  async getAllNexLeases(token: string, onAuthError?: () => void): Promise<NexLease[]> {
    const response = await makeAuthenticatedRequest('/api/nexlease', token, {}, onAuthError);
    return response;
  },

  // Récupérer un NexLease par ID
  async getNexLeaseById(id: number, token: string, onAuthError?: () => void): Promise<NexLease> {
    const response = await makeAuthenticatedRequest(`/api/nexlease/${id}`, token, {}, onAuthError);
    return response;
  },

  // Créer un nouveau NexLease
  async createNexLease(nexleaseData: any, token: string, onAuthError?: () => void): Promise<{ message: string; id: number }> {
    const response = await makeAuthenticatedRequest('/api/nexlease', token, {
      method: 'POST',
      body: JSON.stringify(nexleaseData),
    }, onAuthError);
    return response;
  },

  // Mettre à jour un NexLease
  async updateNexLease(id: number, nexleaseData: Partial<NexLease>, token: string, onAuthError?: () => void): Promise<NexLease> {
    const response = await makeAuthenticatedRequest(`/api/nexlease/${id}`, token, {
      method: 'PUT',
      body: JSON.stringify(nexleaseData),
    }, onAuthError);
    return response;
  },

  // Supprimer un NexLease
  async deleteNexLease(id: number, token: string, onAuthError?: () => void): Promise<void> {
    await makeAuthenticatedRequest(`/api/nexlease/${id}`, token, {
      method: 'DELETE',
    }, onAuthError);
  },
};
