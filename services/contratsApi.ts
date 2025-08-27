import { API_BASE_URL } from "@/constants/Config";

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

async function makeAuthenticatedRequest(
  endpoint: string, 
  token: string, 
  options: RequestInit = {}
): Promise<Response> {
  if (!token) {
    throw new Error("Token d'authentification non trouvé");
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Session expirée. Veuillez vous reconnecter.");
    }
    const errorData = await response.json().catch(() => ({}));
    console.error('Erreur API détaillée:', {
      status: response.status,
      statusText: response.statusText,
      errorData: errorData,
      url: response.url
    });
    throw new Error(errorData.error || errorData.message || `Erreur HTTP: ${response.status}`);
  }

  return response;
}

export const contratsApi = {
  // Récupérer tous les contrats
  async getAllContrats(token: string): Promise<Contrat[]> {
    const response = await makeAuthenticatedRequest('/api/contrats', token);
    return await response.json();
  },

  // Récupérer un contrat par ID
  async getContratById(id: number, token: string): Promise<ContratDetail> {
    const response = await makeAuthenticatedRequest(`/api/contrats/${id}`, token);
    return await response.json();
  },

  // Créer un nouveau contrat
  async createContrat(contratData: Omit<Contrat, 'id'>, token: string): Promise<Contrat> {
    const response = await makeAuthenticatedRequest('/api/contrats', token, {
      method: 'POST',
      body: JSON.stringify(contratData),
    });
    return await response.json();
  },

  // Mettre à jour un contrat
  async updateContrat(id: number, contratData: Partial<Contrat>, token: string): Promise<Contrat> {
    const response = await makeAuthenticatedRequest(`/api/contrats/${id}`, token, {
      method: 'PUT',
      body: JSON.stringify(contratData),
    });
    return await response.json();
  },

  // Supprimer un contrat
  async deleteContrat(id: number, token: string): Promise<void> {
    await makeAuthenticatedRequest(`/api/contrats/${id}`, token, {
      method: 'DELETE',
    });
  },
};


