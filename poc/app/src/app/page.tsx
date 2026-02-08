"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 md:px-8 lg:px-10">
      {/* Logo / title */}
      <div className="text-center mb-10">
        <div className="text-5xl lg:text-6xl mb-4">🎿</div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Ski Decision Engine</h1>
        <p className="text-sm lg:text-base text-gray-500 mt-2 max-w-xs lg:max-w-md">
          Tell us where you live and what pass you have.
          We&apos;ll tell you where to ski and when.
        </p>
      </div>

      {/* POC navigation */}
      <div className="w-full max-w-xs md:max-w-md lg:max-w-lg space-y-3">
        <h2 className="text-[10px] lg:text-xs font-bold tracking-wider text-gray-400 text-center">
          UI PROTOTYPES
        </h2>

        <Link
          href="/onboarding"
          className="flex items-center gap-3 w-full px-4 lg:px-5 py-3 lg:py-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <span className="text-lg lg:text-xl">👋</span>
          <div>
            <div className="text-sm lg:text-base font-semibold text-gray-900">Onboarding</div>
            <div className="text-xs lg:text-sm text-gray-500">3-question setup flow</div>
          </div>
        </Link>

        <Link
          href="/dashboard"
          className="flex items-center gap-3 w-full px-4 lg:px-5 py-3 lg:py-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors border border-blue-200"
        >
          <span className="text-lg lg:text-xl">📊</span>
          <div>
            <div className="text-sm lg:text-base font-semibold text-gray-900">Main Decision Screen</div>
            <div className="text-xs lg:text-sm text-gray-500">
              Your Resorts + Worth Knowing + Storm Tracker
            </div>
          </div>
        </Link>

        <Link
          href="/resort/vail"
          className="flex items-center gap-3 w-full px-4 lg:px-5 py-3 lg:py-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <span className="text-lg lg:text-xl">⛰️</span>
          <div>
            <div className="text-sm lg:text-base font-semibold text-gray-900">Resort Detail</div>
            <div className="text-xs lg:text-sm text-gray-500">10-day forecast, expert take, webcam</div>
          </div>
        </Link>

        <Link
          href="/chase"
          className="flex items-center gap-3 w-full px-4 lg:px-5 py-3 lg:py-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors border border-red-200"
        >
          <span className="text-lg lg:text-xl">🔴</span>
          <div>
            <div className="text-sm lg:text-base font-semibold text-gray-900">Storm Chase Mode</div>
            <div className="text-xs lg:text-sm text-gray-500">National radar → trip builder</div>
          </div>
        </Link>

        <Link
          href="/notifications"
          className="flex items-center gap-3 w-full px-4 lg:px-5 py-3 lg:py-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <span className="text-lg lg:text-xl">🔔</span>
          <div>
            <div className="text-sm lg:text-base font-semibold text-gray-900">Notifications</div>
            <div className="text-xs lg:text-sm text-gray-500">All notification types + timing</div>
          </div>
        </Link>

        <Link
          href="/settings"
          className="flex items-center gap-3 w-full px-4 lg:px-5 py-3 lg:py-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <span className="text-lg lg:text-xl">⚙️</span>
          <div>
            <div className="text-sm lg:text-base font-semibold text-gray-900">Settings</div>
            <div className="text-xs lg:text-sm text-gray-500">Profile, resorts, notifications</div>
          </div>
        </Link>
      </div>

      {/* Footer */}
      <div className="mt-10 text-center">
        <p className="text-[10px] lg:text-xs text-gray-400">
          POC — Ski Decision Engine · Concept Phase
        </p>
      </div>
    </div>
  );
}
