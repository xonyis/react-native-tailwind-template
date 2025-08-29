import { API_BASE_URL, LOGIN_ENDPOINT } from "@/constants/Config";

export type LoginRequest = {
  email: string;
  password: string;
};

// Réponse typique LexikJWTAuthenticationBundle: { token: string }
export type User = {
  id: number;
  email: string;
  nom?: string;
  prenom?: string;
  roles?: string[];
};

export type LoginResponse = {
  token: string;
  user?: User;
};

export async function login(request: LoginRequest): Promise<LoginResponse> {
  const url = `${API_BASE_URL}${LOGIN_ENDPOINT}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      email: request.email,
      password: request.password,
    }),
  });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const data = await response.json();
      errorMessage = data?.message || data?.error || errorMessage;
    } catch (e) {
      // ignore parse error
    }
    throw new Error(errorMessage);
  }

  const data = (await response.json()) as LoginResponse;
  if (!data?.token) {
    throw new Error("Réponse inattendue du serveur: token manquant");
  }
  return data;
}

// Fonction utilitaire pour faire des requêtes authentifiées
export async function makeAuthenticatedRequest(
  endpoint: string,
  token: string,
  options: RequestInit = {},
  onAuthError?: () => void
): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = `Erreur HTTP: ${response.status}`;
    let isAuthError = false;
    
    try {
      const errorData = await response.json();
      console.error('Erreur API détaillée:', {
        errorData,
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });
      
      errorMessage = errorData?.message || errorData?.error || errorMessage;
      
      // Détecter les erreurs d'authentification
      if (response.status === 401 || 
          response.status === 403 || 
          errorMessage.toLowerCase().includes('jwt') ||
          errorMessage.toLowerCase().includes('token') ||
          errorMessage.toLowerCase().includes('authentification') ||
          errorMessage.toLowerCase().includes('non autorisé') ||
          errorMessage.toLowerCase().includes('session expirée')) {
        isAuthError = true;
      }
    } catch (e) {
      console.error('Erreur lors du parsing de la réponse d\'erreur:', e);
      // Si on ne peut pas parser la réponse, on considère que c'est une erreur d'auth si le status est 401/403
      if (response.status === 401 || response.status === 403) {
        isAuthError = true;
      }
    }
    
    // Si c'est une erreur d'authentification, appeler le callback
    if (isAuthError && onAuthError) {
      onAuthError();
    }
    
    throw new Error(errorMessage);
  }

  try {
    return await response.json();
  } catch (e) {
    throw new Error('Erreur lors du parsing de la réponse JSON');
  }
}


