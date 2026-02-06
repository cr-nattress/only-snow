/**
 * Preferences storage service.
 *
 * Uses localStorage for now. Structured so that API backend storage
 * can be swapped in when frontend and backend auth are unified.
 */

import type { UserPersona, PassType } from '@/data/types';

// ── Stored shape ─────────────────────────────────────────────────────

export interface StoredPreferences {
  location: string;
  passType: string; // epic | ikon | indy | multi | none
  driveRadius: number;
  chaseWillingness: string; // anywhere | driving | no
  persona: string; // legacy persona ID
  userPersona: UserPersona | null;
  onboardingComplete: boolean;
}

const STORAGE_KEY = 'onlysnow_preferences';

const DEFAULTS: StoredPreferences = {
  location: '',
  passType: '',
  driveRadius: 120,
  chaseWillingness: '',
  persona: 'powder-hunter',
  userPersona: null,
  onboardingComplete: false,
};

// ── Storage interface (for future API swap) ──────────────────────────

interface PreferencesStorage {
  load(): StoredPreferences | null;
  save(prefs: StoredPreferences): void;
  clear(): void;
}

// ── localStorage implementation ──────────────────────────────────────

const localStorageBackend: PreferencesStorage = {
  load() {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as StoredPreferences;
    } catch {
      return null;
    }
  },

  save(prefs: StoredPreferences) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // Storage full or disabled — fail silently
    }
  },

  clear() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // fail silently
    }
  },
};

// ── Public API ───────────────────────────────────────────────────────

const storage: PreferencesStorage = localStorageBackend;

export function loadPreferences(): StoredPreferences | null {
  return storage.load();
}

export function savePreferences(prefs: StoredPreferences): void {
  storage.save(prefs);
}

export function clearPreferences(): void {
  storage.clear();
}

export function getDefaults(): StoredPreferences {
  return { ...DEFAULTS };
}
