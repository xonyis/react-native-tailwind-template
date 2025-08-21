import { API_BASE_URL, CONTRATS_ENDPOINT } from "@/constants/Config";

export type Contrat = Record<string, unknown>;

export async function fetchContrats(token: string): Promise<Contrat[]> {
  const response = await fetch(`${API_BASE_URL}${CONTRATS_ENDPOINT}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const data = await response.json();
      errorMessage = data?.message || data?.error || errorMessage;
    } catch (e) {
      // ignore
    }
    throw new Error(errorMessage);
  }

  const data = (await response.json()) as Contrat[];
  return data;
}


