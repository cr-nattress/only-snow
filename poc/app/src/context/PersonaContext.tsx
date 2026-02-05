"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Persona } from "@/data/types";

interface PersonaContextType {
  persona: Persona;
  setPersona: (persona: Persona) => void;
}

const PersonaContext = createContext<PersonaContextType | undefined>(undefined);

export function PersonaProvider({ children }: { children: ReactNode }) {
  const [persona, setPersona] = useState<Persona>("powder-hunter");

  return (
    <PersonaContext.Provider value={{ persona, setPersona }}>
      {children}
    </PersonaContext.Provider>
  );
}

export function usePersona(): PersonaContextType {
  const context = useContext(PersonaContext);
  if (context === undefined) {
    throw new Error("usePersona must be used within a PersonaProvider");
  }
  return context;
}
