import { makeAuthenticatedRequest } from './authApi';

export interface Materiel {
  id: number;
  nom: string;
  reference: string;
  etat: string;
  type_materiel: string;
  date_achat: string;
  quantite_total: number;
  client: string;
}

export interface ClientDetails {
  id: number;
  nom: string;
  email: string;
  telephone: string;
  referenceClient: string;
  adresseClient: string;
  ville: string;
  codePostal: string;
  pays: string;
}

export interface MaterielDetail extends Omit<Materiel, 'client'> {
  client: ClientDetails | null;
}

export const materielsApi = {
  // Récupérer tous les matériels
  async getAllMateriels(token: string, onAuthError?: () => void): Promise<Materiel[]> {
    const response = await makeAuthenticatedRequest('/api/materiels', token, {}, onAuthError);
    return response;
  },

  // Récupérer un matériel par ID
  async getMaterielById(id: number, token: string, onAuthError?: () => void): Promise<MaterielDetail> {
    const response = await makeAuthenticatedRequest(`/api/materiels/${id}`, token, {}, onAuthError);
    return response;
  },

  // Créer un nouveau matériel
  async createMateriel(materielData: Omit<Materiel, 'id'>, token: string, onAuthError?: () => void): Promise<Materiel> {
    const response = await makeAuthenticatedRequest('/api/materiels', token, {
      method: 'POST',
      body: JSON.stringify(materielData),
    }, onAuthError);
    return response;
  },

  // Mettre à jour un matériel
  async updateMateriel(id: number, materielData: Partial<Materiel>, token: string, onAuthError?: () => void): Promise<Materiel> {
    const response = await makeAuthenticatedRequest(`/api/materiels/${id}`, token, {
      method: 'PUT',
      body: JSON.stringify(materielData),
    }, onAuthError);
    return response;
  },

  // Supprimer un matériel
  async deleteMateriel(id: number, token: string, onAuthError?: () => void): Promise<void> {
    await makeAuthenticatedRequest(`/api/materiels/${id}`, token, {
      method: 'DELETE',
    }, onAuthError);
  },
};
