"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { usePersona } from "@/context/PersonaContext";
import type { UserPersona } from "@/data/types";
import {
  loadPreferences,
  savePreferences,
  type StoredPreferences,
  getDefaults,
} from "@/lib/preferences";
import { newToLegacyPersona } from "@/data/personas";

interface PreferencesContextType {
  /** All stored preferences */
  preferences: StoredPreferences;
  /** Whether preferences have been loaded from storage */
  loaded: boolean;
  /** Whether user has completed onboarding (has saved preferences) */
  hasPreferences: boolean;
  /** Update one or more preference fields and persist immediately */
  updatePreferences: (partial: Partial<StoredPreferences>) => void;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(
  undefined,
);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const { setPersona, setUserPersona } = usePersona();
  const [preferences, setPreferences] = useState<StoredPreferences>(
    getDefaults(),
  );
  const [loaded, setLoaded] = useState(false);

  // Load preferences from storage on mount
  useEffect(() => {
    const stored = loadPreferences();
    if (stored) {
      setPreferences(stored);
      // Sync persona context with stored values
      if (stored.userPersona) {
        setUserPersona(stored.userPersona);
      } else if (stored.persona) {
        setPersona(stored.persona as Parameters<typeof setPersona>[0]);
      }
    }
    setLoaded(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const hasPreferences = loaded && preferences.onboardingComplete;

  const updatePreferences = useCallback(
    (partial: Partial<StoredPreferences>) => {
      setPreferences((prev) => {
        const next = { ...prev, ...partial };
        savePreferences(next);

        // Keep persona context in sync
        if (partial.userPersona !== undefined && partial.userPersona) {
          setUserPersona(partial.userPersona);
        } else if (partial.persona !== undefined) {
          setPersona(partial.persona as Parameters<typeof setPersona>[0]);
        }

        return next;
      });
    },
    [setPersona, setUserPersona],
  );

  return (
    <PreferencesContext.Provider
      value={{ preferences, loaded, hasPreferences, updatePreferences }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences(): PreferencesContextType {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error(
      "usePreferences must be used within a PreferencesProvider",
    );
  }
  return context;
}
