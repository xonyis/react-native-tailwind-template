import { makeAuthenticatedRequest } from './authApi';

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

export interface Contrat {
  id: number;
  date_signature: string | null;
  date_expiration: string | null;
  type_contrat: string;
  statut: string;
  commentaire: string | null;
  nombreServPhysique: number;
  nombreServVirtuel: number;
  nombrePcFixe: number;
  nombrePcPortable: number;
  nombreUtilisateurClientLeger: number;
  nombreRouter: number;
  nombreTelemaintenanceAssistance: number;
  securiteFirewall: number;
  pointAccesWifiIndoor: number;
  retentionSauvegarde: number;
  forfaitSauvegardePoste: number;
  cryptoprotect: boolean;
  nombrePostesCryptoprotect: number;
  antispamProtectionGold: number;
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


