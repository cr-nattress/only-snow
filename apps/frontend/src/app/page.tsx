"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Home() {
  const { status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAuthenticated = status === "authenticated";

  return (
    <div className="h-screen relative overflow-hidden">
      {/* Animated Background - Replace with Whisk AI generated GIF */}
      <div className="absolute inset-0 z-0">
        {/* Placeholder for animated GIF background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950 animate-gradient-shift" />

        {/* Animated snow particles overlay */}
        <div className="absolute inset-0 opacity-30">
          {mounted && [...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full animate-snow-fall"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 10}s`,
              }}
            />
          ))}
        </div>

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/20 to-blue-950/60 dark:to-slate-950/80" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Hero Section */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-4">
          {/* Logo & Tagline */}
          <div className="text-center mb-4 md:mb-6 space-y-3">
            {/* Animated Logo */}
            <div className="inline-flex items-center gap-3 mb-2">
              <span className="text-5xl md:text-7xl animate-bounce-slow">🏔️</span>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              Find Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white animate-shimmer">
                Perfect Pow Day
              </span>
            </h1>

            <p className="text-base md:text-xl text-blue-50 dark:text-slate-300 max-w-2xl mx-auto font-medium leading-snug mt-3">
              Tell us where you live and what pass you have.
              <span className="block mt-1 text-white font-bold">
                We'll tell you where to ski and when.
              </span>
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md mt-4">
            <Link
              href={isAuthenticated ? "/dashboard" : "/onboarding"}
              className="group relative overflow-hidden rounded-xl bg-white hover:bg-blue-50 text-blue-600 dark:text-blue-700 px-6 py-3.5 text-base font-bold text-center transition-all duration-300 transform hover:scale-105 hover:shadow-2xl btn-press"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isAuthenticated ? (
                  <>
                    <span>Open Dashboard</span>
                    <span className="text-xl">📊</span>
                  </>
                ) : (
                  <>
                    <span>Start Your Journey</span>
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
              { icon: "🗺️", text: "Regional View" },
              { icon: "🔔", text: "Smart Alerts" },
            ].map((feature) => (
              <div
                key={feature.text}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-medium"
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
