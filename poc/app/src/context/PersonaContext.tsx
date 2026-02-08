"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Persona, PersonaType, UserPersona } from "@/data/types";
import { newToLegacyPersona } from "@/data/personas";

interface PersonaContextType {
  // Legacy persona (for backward compatibility)
  persona: Persona;
  setPersona: (persona: Persona) => void;
  // New user persona with signals
  userPersona: UserPersona | null;
  setUserPersona: (userPersona: UserPersona) => void;
  // Get the effective persona type (from userPersona.primary or mapped from legacy)
  effectivePersonaType: PersonaType;
}

const PersonaContext = createContext<PersonaContextType | undefined>(undefined);

export function PersonaProvider({ children }: { children: ReactNode }) {
  const [persona, setPersonaState] = useState<Persona>("powder-hunter");
  const [userPersona, setUserPersonaState] = useState<UserPersona | null>(null);

  // When setting userPersona, also update legacy persona for backward compatibility
  const setUserPersona = (up: UserPersona) => {
    setUserPersonaState(up);
    // Update legacy persona to match
    const legacyPersona = newToLegacyPersona(up.primary);
    setPersonaState(legacyPersona);
  };

  // When setting legacy persona directly, clear userPersona
  const setPersona = (p: Persona) => {
    setPersonaState(p);
    // Don't clear userPersona as it might be intentional override
  };

  // Get effective persona type - prefer userPersona if available
  const effectivePersonaType: PersonaType = userPersona
    ? userPersona.primary
    : legacyToPersonaType(persona);

  return (
    <PersonaContext.Provider
      value={{
        persona,
        setPersona,
        userPersona,
        setUserPersona,
        effectivePersonaType,
      }}
    >
      {children}
    </PersonaContext.Provider>
  );
}

// Map legacy persona to new PersonaType
function legacyToPersonaType(legacy: Persona): PersonaType {
  const mapping: Record<Persona, PersonaType> = {
    "powder-hunter": "core-local",
    "family-planner": "family-planner",
    "weekend-warrior": "weekend-warrior",
    "destination-traveler": "storm-chaser",
    beginner: "learning-curve",
  };
  return mapping[legacy];
}

export function usePersona(): PersonaContextType {
  const context = useContext(PersonaContext);
  if (context === undefined) {
    throw new Error("usePersona must be used within a PersonaProvider");
  }
  return context;
}
