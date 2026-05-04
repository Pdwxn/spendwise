"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { apiRequest } from "@/lib/api";

type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string | null;
  authProvider: "email" | "google" | "both";
};

type AuthSession = {
  access: string;
  refresh: string;
  user: AuthUser;
};

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  login: (input: { email: string; password: string }) => Promise<void>;
  register: (input: { firstName: string; lastName: string; email: string; password: string }) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

type AuthUserPayload = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string | null;
  authProvider: AuthUser["authProvider"];
};

const STORAGE_KEY = "spendwise:auth-session";

const AuthContext = createContext<AuthContextValue | null>(null);

function normalizeUser(payload: AuthUserPayload): AuthUser {
  return {
    id: payload.id,
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    avatarUrl: payload.avatarUrl ?? null,
    authProvider: payload.authProvider,
  };
}

async function requestSession(path: string, body: unknown) {
  return apiRequest(path, {
    method: "POST",
    body: JSON.stringify(body),
  }) as Promise<AuthSession>;
}

async function loadCurrentUser(accessToken: string) {
  return apiRequest("/api/auth/me/", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }) as Promise<AuthUserPayload>;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (raw) {
      try {
        const parsed = JSON.parse(raw) as AuthSession;
        setSession({
          access: parsed.access,
          refresh: parsed.refresh,
          user: normalizeUser(parsed.user),
        });
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }

    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated || !session?.access) {
      return;
    }

    let cancelled = false;

    loadCurrentUser(session.access)
      .then((user) => {
        if (!cancelled) {
          setSession((current) => (current ? { ...current, user: normalizeUser(user) } : current));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSession(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isHydrated, session?.access]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (session) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      return;
    }

    window.localStorage.removeItem(STORAGE_KEY);
  }, [isHydrated, session]);

  const value = useMemo<AuthContextValue>(() => {
    async function login(input: { email: string; password: string }) {
      const nextSession = await requestSession("/api/auth/login/", input);
      setSession({ ...nextSession, user: normalizeUser(nextSession.user) });
    }

    async function register(input: { firstName: string; lastName: string; email: string; password: string }) {
      const nextSession = await requestSession("/api/auth/register/", input);
      setSession({ ...nextSession, user: normalizeUser(nextSession.user) });
    }

    async function loginWithGoogle(idToken: string) {
      const nextSession = await requestSession("/api/auth/google/", { idToken });
      setSession({ ...nextSession, user: normalizeUser(nextSession.user) });
    }

    async function refreshSession() {
      if (!session?.refresh) {
        return;
      }

      const nextSession = (await apiRequest("/api/auth/refresh/", {
        method: "POST",
        body: JSON.stringify({ refresh: session.refresh }),
      })) as { access: string };

      setSession((current) => (current ? { ...current, access: nextSession.access } : current));
    }

    async function logout() {
      if (session?.refresh) {
        try {
          await apiRequest("/api/auth/logout/", {
            method: "POST",
            body: JSON.stringify({ refresh: session.refresh }),
          });
        } catch {
          // local logout should still clear client state
        }
      }

      setSession(null);
    }

    return {
      user: session?.user ?? null,
      accessToken: session?.access ?? null,
      refreshToken: session?.refresh ?? null,
      isAuthenticated: Boolean(session?.access),
      isHydrated,
      login,
      register,
      loginWithGoogle,
      logout,
      refreshSession,
    };
  }, [isHydrated, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}

export { AuthContext };
