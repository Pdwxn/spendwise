"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { ApiError, apiRequest } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export type UserPreferences = {
  currency: "CLP" | "COP" | "USD" | "EUR";
  theme: "dark" | "light";
  language: "es" | "en";
};

type PreferencesContextValue = {
  preferences: UserPreferences;
  isHydrated: boolean;
  updatePreferences: (input: Partial<UserPreferences>) => Promise<void>;
};

const STORAGE_KEY = "spendwise:user-preferences";

const DEFAULT_PREFERENCES: UserPreferences = {
  currency: "USD",
  theme: "dark",
  language: "es",
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

function normalizePreferences(value: unknown): UserPreferences {
  if (!value || typeof value !== "object") {
    return DEFAULT_PREFERENCES;
  }

  const record = value as Partial<Record<keyof UserPreferences, unknown>>;
  const currency = ["CLP", "COP", "USD", "EUR"].includes(String(record.currency))
    ? (record.currency as UserPreferences["currency"])
    : DEFAULT_PREFERENCES.currency;
  const theme = record.theme === "light" ? "light" : "dark";
  const language = record.language === "en" ? "en" : "es";

  return { currency, theme, language };
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const { accessToken, isAuthenticated, isHydrated: isAuthHydrated, refreshSession } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (raw) {
      try {
        setPreferences(normalizePreferences(JSON.parse(raw)));
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }

    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    document.documentElement.lang = preferences.language;
    document.documentElement.dataset.theme = preferences.theme;
  }, [isHydrated, preferences]);

  useEffect(() => {
    if (!isAuthHydrated) {
      return;
    }

    if (!isAuthenticated || !accessToken) {
      setPreferences(DEFAULT_PREFERENCES);
      return;
    }

    let cancelled = false;

    async function request(path: string, init: RequestInit = {}, retry = true) {
      try {
        return await apiRequest(path, {
          ...init,
          headers: {
            Authorization: `Bearer ${accessToken}`,
            ...(init.headers ?? {}),
          },
        });
      } catch (error) {
        if (retry && error instanceof ApiError && error.status === 401) {
          const nextAccessToken = await refreshSession();

          if (nextAccessToken) {
            return apiRequest(path, {
              ...init,
              headers: {
                Authorization: `Bearer ${nextAccessToken}`,
                ...(init.headers ?? {}),
              },
            });
          }
        }

        throw error;
      }
    }

    request("/api/auth/preferences/")
      .then((value) => {
        if (!cancelled) {
          setPreferences(normalizePreferences(value));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPreferences(DEFAULT_PREFERENCES);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken, isAuthenticated, isAuthHydrated, refreshSession]);

  async function updatePreferences(input: Partial<UserPreferences>) {
    if (!accessToken) {
      throw new Error("No hay sesión activa.");
    }

    const response = (await apiRequest("/api/auth/preferences/", {
      method: "PATCH",
      body: JSON.stringify(input),
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })) as UserPreferences;

    setPreferences(normalizePreferences(response));
  }

  const value = useMemo<PreferencesContextValue>(
    () => ({ preferences, isHydrated, updatePreferences }),
    [isHydrated, preferences],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const context = useContext(PreferencesContext);

  if (context === null) {
    throw new Error("usePreferences must be used within PreferencesProvider.");
  }

  return context;
}
