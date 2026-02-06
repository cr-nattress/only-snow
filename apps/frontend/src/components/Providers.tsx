"use client";

import { SessionProvider } from "next-auth/react";
import { PersonaProvider } from "@/context/PersonaContext";
import { PreferencesProvider } from "@/context/PreferencesContext";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <PersonaProvider>
        <PreferencesProvider>{children}</PreferencesProvider>
      </PersonaProvider>
    </SessionProvider>
  );
}
