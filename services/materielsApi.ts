import { makeAuthenticatedRequest } from './authApi';

export interface Materiel {
  id: number;
  nom: string;
  reference: string | null;
  etat: string | null;
  type_materiel: string;
  date_achat: string;
  date_commande_fournisseur: string | null;
  nom_fournisseur: string | null;
  is_obsolete: boolean;
  commentaire: string | null;
  os: string | null;
  quantite_total: number;
  client: string;
}

export interface ClientDetails {
  id: number;
  nom: string;
  adresseEmail1: string | null;
  adresseEmail2: string | null;
  adresseClient: string | null;
  ville: string | null;
  codePostal: string | null;
  pays: string | null;
  numeroTel1: string | null;
  numeroTel2: string | null;
  referenceClient: string | null;
  typeClient: string | null;
  visiteAnnuelle: string | null;
  commentaire: string | null;
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
