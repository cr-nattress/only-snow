"use client";

import { SessionProvider } from "next-auth/react";
import { PersonaProvider } from "@/context/PersonaContext";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <PersonaProvider>{children}</PersonaProvider>
    </SessionProvider>
  );
}
