import { makeAuthenticatedRequest } from './authApi';

export interface ClientDetails {
  id: number;
  nom: string;
  email: string;
  telephone: string;
  referenceClient: string | null;
  adresseClient: string;
  ville: string;
  codePostal: string;
  pays: string | null;
}

export interface Contrat {
  id: number;
  date_signature: string | null;
  date_expiration: string | null;
  type_contrat: string;
  statut: string;
  client: string | null;
}

export interface ContratDetail extends Omit<Contrat, 'client'> {
  client: ClientDetails | null;
}



export const contratsApi = {
  // Récupérer tous les contrats
  async getAllContrats(token: string): Promise<Contrat[]> {
    const response = await makeAuthenticatedRequest('/api/contrats', token);
    return response;
  },

  // Récupérer un contrat par ID
  async getContratById(id: number, token: string): Promise<ContratDetail> {
    const response = await makeAuthenticatedRequest(`/api/contrats/${id}`, token);
    return response;
  },

  // Créer un nouveau contrat
  async createContrat(contratData: Omit<Contrat, 'id'>, token: string): Promise<Contrat> {
    const response = await makeAuthenticatedRequest('/api/contrats', token, {
      method: 'POST',
      body: JSON.stringify(contratData),
    });
    return response;
  },

  // Mettre à jour un contrat
  async updateContrat(id: number, contratData: Partial<Contrat>, token: string): Promise<Contrat> {
    const response = await makeAuthenticatedRequest(`/api/contrats/${id}`, token, {
      method: 'PUT',
      body: JSON.stringify(contratData),
    });
    return response;
  },

  // Supprimer un contrat
  async deleteContrat(id: number, token: string): Promise<void> {
    await makeAuthenticatedRequest(`/api/contrats/${id}`, token, {
      method: 'DELETE',
    });
  },
};


