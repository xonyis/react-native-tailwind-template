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


