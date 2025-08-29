import { makeAuthenticatedRequest } from './authApi';

export interface Client {
  id: number;
  nom: string;
  email: string;
  telephone: string;
  raisonSocial: string | null;
  adresseClient: string;
  ville: string;
  codePostal: string;
  numeroTel1: string | null;
  numeroTel2: string | null;
  siret: string | null;
  typeClient: string | null;
  latitude: number | null;
  longitude: number | null;
  referenceClient: string | null;
  visiteAnnuelle: string | null;
}



export const clientsApi = {
  // Récupérer tous les clients
  async getAllClients(token: string): Promise<Client[]> {
    const response = await makeAuthenticatedRequest('/api/clients', token);
    return response;
  },

  // Récupérer un client par ID
  async getClientById(id: number, token: string): Promise<Client> {
    const response = await makeAuthenticatedRequest(`/api/clients/${id}`, token);
    return response;
  },

  // Créer un nouveau client
  async createClient(clientData: Omit<Client, 'id'>, token: string): Promise<Client> {
    const response = await makeAuthenticatedRequest('/api/clients', token, {
      method: 'POST',
      body: JSON.stringify(clientData),
    });
    return response;
  },

  // Mettre à jour un client
  async updateClient(id: number, clientData: Partial<Client>, token: string): Promise<Client> {
    const response = await makeAuthenticatedRequest(`/api/clients/${id}`, token, {
      method: 'PUT',
      body: JSON.stringify(clientData),
    });
    return response;
  },

  // Supprimer un client
  async deleteClient(id: number, token: string): Promise<void> {
    await makeAuthenticatedRequest(`/api/clients/${id}`, token, {
      method: 'DELETE',
    });
  },
};