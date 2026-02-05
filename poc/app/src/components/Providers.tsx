"use client";

import { PersonaProvider } from "@/context/PersonaContext";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <PersonaProvider>{children}</PersonaProvider>;
}
