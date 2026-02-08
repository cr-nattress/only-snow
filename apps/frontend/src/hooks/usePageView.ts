"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { log } from "@/lib/log";

export function usePageView() {
  const pathname = usePathname();

  useEffect(() => {
    log("page.view", { path: pathname });
  }, [pathname]);
}
