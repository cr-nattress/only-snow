"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { usePersona } from "@/context/PersonaContext";
import { getPersonaInfo, getPersonaInfoV2 } from "@/data/personas";
import { Persona, PersonaType } from "@/data/types";
import { log } from "@/lib/log";

function getPersonaEmoji(p: Persona): string {
  switch (p) {
    case "powder-hunter": return "❄️";
    case "family-planner": return "👨‍👩‍👧";
    case "weekend-warrior": return "⏰";
    case "destination-traveler": return "✈️";
    case "beginner": return "⭐";
    default: return "❄️";
  }
}

function getPersonaTypeEmoji(p: PersonaType): string {
  switch (p) {
    case "core-local": return "🎿";
    case "storm-chaser": return "🌨️";
    case "family-planner": return "👨‍👩‍👧";
    case "weekend-warrior": return "⏰";
    case "resort-loyalist": return "🏔️";
    case "learning-curve": return "⭐";
    case "social-skier": return "🍻";
    case "luxury-seeker": return "✨";
    case "budget-maximizer": return "💰";
    default: return "🎿";
  }
}

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export default function Header() {
  const { data: session, status } = useSession();
  const { persona, userPersona, effectivePersonaType } = usePersona();
  const personaInfo = userPersona
    ? getPersonaInfoV2(userPersona.primary)
    : getPersonaInfo(persona);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isAuthenticated = status === "authenticated" && session?.user;
  const userImage = session?.user?.image;
  const userName = session?.user?.name;
  const initials = getInitials(userName);

  return (
    <header
      className={`sticky top-0 z-50 px-4 md:px-6 lg:px-8 py-2.5 md:py-3 flex items-center justify-between transition-all duration-200 ${
        isScrolled
          ? "bg-blue-500/90 dark:bg-slate-800/90 backdrop-blur-md shadow-md"
          : "bg-transparent"
      }`}
      style={{ paddingTop: "calc(0.625rem + env(safe-area-inset-top))" }}
    >
      <Link href="/dashboard" className="flex items-center gap-1.5 btn-press" onClick={() => log("nav.logo_click")}>
        <span className="text-lg lg:text-xl">🏔️</span>
        <span className="text-lg lg:text-xl font-extrabold tracking-tight text-white">
          Only<span className="text-blue-100 dark:text-blue-300">Snow</span>
        </span>
      </Link>

      <div className="flex items-center gap-2">
        {/* Persona Badge */}
        <Link
          href="/settings"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/20 dark:bg-white/10 hover:bg-white/30 dark:hover:bg-white/20 transition-colors btn-press"
          title={`${personaInfo.label}: ${personaInfo.focus}`}
          onClick={() => log("nav.persona_badge_click")}
        >
          <span className="text-sm">{userPersona ? getPersonaTypeEmoji(effectivePersonaType) : getPersonaEmoji(persona)}</span>
          <span className="text-xs font-medium text-white hidden md:inline">{personaInfo.label}</span>
        </Link>

        {/* Account Icon */}
        {isAuthenticated ? (
          <Link
            href="/settings"
            className="w-8 h-8 lg:w-9 lg:h-9 rounded-full overflow-hidden bg-white/20 dark:bg-white/10 flex items-center justify-center hover:ring-2 hover:ring-white/50 transition-all btn-press"
            title={userName || "Account"}
            onClick={() => log("nav.account_click")}
          >
            {userImage ? (
              <Image
                src={userImage}
                alt={userName || "Profile"}
                width={36}
                height={36}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm lg:text-base text-white font-bold">{initials}</span>
            )}
          </Link>
        ) : (
          <Link
            href="/auth/signin"
            className="px-3 py-1.5 rounded-full bg-white/20 dark:bg-white/10 hover:bg-white/30 dark:hover:bg-white/20 transition-colors btn-press"
            onClick={() => log("nav.account_click")}
          >
            <span className="text-xs font-semibold text-white">Sign in</span>
          </Link>
        )}
      </div>
    </header>
  );
}
