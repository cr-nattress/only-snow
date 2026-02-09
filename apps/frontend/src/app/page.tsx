"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Home() {
  const { status } = useSession();

  const isAuthenticated = status === "authenticated";

  return (
    <div className="h-screen relative overflow-hidden">
      {/* Animated Video Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="/splash-animated.gif"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/50" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Hero Section */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-4">
          {/* Logo & Tagline */}
          <div className="text-center mb-4 md:mb-6 space-y-3">
<h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
              <span className="text-white">Chase storms.</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-white">
                Not forecasts.
              </span>
            </h1>

            <p className="text-base md:text-xl text-white max-w-2xl mx-auto font-bold leading-snug mt-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              Know exactly where to ski — every day.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center gap-3 w-full max-w-md mt-4">
            <Link
              href={isAuthenticated ? "/dashboard" : "/onboarding"}
              className="group relative overflow-hidden rounded-xl bg-white/95 hover:bg-white text-slate-900 px-6 py-3.5 text-base font-bold text-center transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg shadow-black/30 btn-press"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isAuthenticated ? (
                  <>
                    <span>Open Dashboard</span>
                    <span className="text-xl">📊</span>
                  </>
                ) : (
                  <>
                    <span>Get Started</span>
                    <span className="text-xl">🚀</span>
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-200 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            </Link>
          </div>

          {/* Feature Pills */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 max-w-2xl">
            {[
              { icon: "❄️", text: "Live Snow Reports" },
              { icon: "🌨️", text: "Storm Tracking" },
{ icon: "🔔", text: "Smart Alerts" },
            ].map((feature) => (
              <div
                key={feature.text}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/30 text-white text-xs font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
              >
                <span className="text-base">{feature.icon}</span>
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer - hidden on mobile, visible on desktop */}
        <div className="hidden lg:block px-4 pb-6 text-center">
          <p className="text-xs text-blue-100 dark:text-slate-500">
            ❄️ OnlySnow · Where to ski and when · Concept Phase
          </p>
        </div>

        {/* Mobile safe area spacing for bottom nav */}
        <div className="lg:hidden h-20" />
      </div>
    </div>
  );
}
