"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  clearSession,
  getToken,
  getUser,
  saveSession,
  type SessionUser,
} from "@/lib/session";

import { api } from "@/lib/api";

type LoginResponse = {
  access_token: string;
};

type AuthContextType = {
  token: string | null;
  user: SessionUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined,
  );

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [token, setToken] =
    useState<string | null>(null);

  const [user, setUser] =
    useState<SessionUser | null>(null);

  const [loading, setLoading] =
    useState(true);

  // Restore the saved session when the app starts.
  useEffect(() => {
    const storedToken = getToken();
    const storedUser = getUser();

    setToken(storedToken);
    setUser(storedUser);
    setLoading(false);
  }, []);

  async function signIn(
    email: string,
    password: string,
  ): Promise<void> {
    const response =
      await api<LoginResponse>("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

    const sessionUser: SessionUser = {
      email,
    };

    saveSession(
      response.access_token,
      sessionUser,
    );

    setToken(response.access_token);
    setUser(sessionUser);
  }

  function signOut(): void {
    clearSession();
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider",
    );
  }

  return context;
}