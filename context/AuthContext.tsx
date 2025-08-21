import { login as loginApi, type LoginRequest, type User } from "@/services/authApi";
import * as SecureStore from "expo-secure-store";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type AuthState = {
  token: string | null;
  isLoading: boolean;
  error: string | null;
  user: User | null;
};

type AuthContextValue = {
  token: string | null;
  isLoading: boolean;
  error: string | null;
  signIn: (credentials: LoginRequest) => Promise<void>;
  signOut: () => Promise<void>;
  user: User | null;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({ token: null, isLoading: true, error: null, user: null });

  useEffect(() => {
    (async () => {
      try {
        const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
        const storedUserRaw = await SecureStore.getItemAsync(USER_KEY);
        const storedUser: User | null = storedUserRaw ? JSON.parse(storedUserRaw) : null;
        setState({ token: storedToken ?? null, isLoading: false, error: null, user: storedUser });
      } catch (e) {
        setState({ token: null, isLoading: false, error: "Impossible de récupérer la session" });
      }
    })();
  }, []);

  const signIn = useCallback(async ({ email, password }: LoginRequest) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const { token, user } = await loginApi({ email, password });
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      if (user) {
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
      } else {
        await SecureStore.deleteItemAsync(USER_KEY);
      }
      setState({ token, isLoading: false, error: null, user: user ?? null });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Échec de connexion";
      setState({ token: null, isLoading: false, error: message, user: null });
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
    } finally {
      setState({ token: null, isLoading: false, error: null, user: null });
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    token: state.token,
    isLoading: state.isLoading,
    error: state.error,
    signIn,
    signOut,
    user: state.user,
  }), [state.token, state.isLoading, state.error, state.user, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans un AuthProvider");
  return ctx;
}


