// Configuration centralisée (URL API, endpoints)
// Vous pouvez définir EXPO_PUBLIC_API_BASE_URL et EXPO_PUBLIC_LOGIN_ENDPOINT
// via vos variables d'environnement ou un fichier .env.*

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://gestinfo.jkcprod.com";

// Pour Symfony avec lexik/jwt-authentication-bundle, l'endpoint par défaut est /api/login_check
export const LOGIN_ENDPOINT =
  process.env.EXPO_PUBLIC_LOGIN_ENDPOINT ?? "/api/auth/login";

export const CONTRATS_ENDPOINT = "/api/contrats";


