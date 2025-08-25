import { API_BASE_URL } from "@/constants/Config";

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
    throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
  }

  return response;
}

export const clientsApi = {
  // Récupérer tous les clients
  async getAllClients(token: string): Promise<Client[]> {
    const response = await makeAuthenticatedRequest('/api/clients', token);
    return await response.json();
  },

  // Récupérer un client par ID
  async getClientById(id: number, token: string): Promise<Client> {
    const response = await makeAuthenticatedRequest(`/api/clients/${id}`, token);
    return await response.json();
  },

  // Créer un nouveau client
  async createClient(clientData: Omit<Client, 'id'>, token: string): Promise<Client> {
    const response = await makeAuthenticatedRequest('/api/clients', token, {
      method: 'POST',
      body: JSON.stringify(clientData),
    });
    return await response.json();
  },

  // Mettre à jour un client
  async updateClient(id: number, clientData: Partial<Client>, token: string): Promise<Client> {
    const response = await makeAuthenticatedRequest(`/api/clients/${id}`, token, {
      method: 'PUT',
      body: JSON.stringify(clientData),
    });
    return await response.json();
  },

  // Supprimer un client
  async deleteClient(id: number, token: string): Promise<void> {
    await makeAuthenticatedRequest(`/api/clients/${id}`, token, {
      method: 'DELETE',
    });
  },
};