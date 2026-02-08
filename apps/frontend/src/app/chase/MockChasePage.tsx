"use client";

import { useState } from "react";
import Link from "next/link";
import { chaseRegions, tellurideTripPlan } from "@/data/scenarios";
import { StormSeverity } from "@/data/types";
import { log } from "@/lib/log";

const severityConfig: Partial<Record<StormSeverity, { bg: string; border: string; text: string; label: string; icon: string }>> = {
  quiet: { bg: "bg-gray-50 dark:bg-slate-700", border: "border-gray-200 dark:border-slate-600", text: "text-gray-500 dark:text-slate-400", label: "QUIET", icon: "" },
  moderate: { bg: "bg-yellow-50 dark:bg-yellow-900/30", border: "border-yellow-200 dark:border-yellow-700", text: "text-yellow-800 dark:text-yellow-300", label: "MODERATE", icon: "🟡" },
  significant: { bg: "bg-orange-50 dark:bg-orange-900/30", border: "border-orange-200 dark:border-orange-700", text: "text-orange-800 dark:text-orange-300", label: "SIGNIFICANT", icon: "🟠" },
  chase: { bg: "bg-red-50 dark:bg-red-900/30", border: "border-red-300 dark:border-red-700", text: "text-red-800 dark:text-red-300", label: "MAJOR EVENT", icon: "🔴" },
};

const defaultSeverityConfig = { bg: "bg-gray-50 dark:bg-slate-700", border: "border-gray-200 dark:border-slate-600", text: "text-gray-500 dark:text-slate-400", label: "UNKNOWN", icon: "" };

type View = "national" | "region" | "trip";

export default function MockChasePage() {
  const [view, setView] = useState<View>("national");
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const region = chaseRegions.find((r) => r.id === selectedRegion);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-4 md:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-3">
          {view === "national" ? (
            <Link href="/dashboard" className="text-white/70 hover:text-white">
              ←
            </Link>
          ) : (
            <button
              onClick={() => {
                log("chase.back_click", { from: view });
                if (view === "trip") setView("region");
                else setView("national");
              }}
              className="text-white/70 hover:text-white"
            >
              ←
            </button>
          )}
          <div>
            <h1 className="text-lg lg:text-xl font-bold text-white">
              {view === "national" && "Storm Tracker"}
              {view === "region" && region?.name}
              {view === "trip" && "Chase Trip Plan"}
            </h1>
            <p className="text-xs lg:text-sm text-blue-100 dark:text-slate-400">
              {view === "national" && "National Overview · Next 10 Days"}
              {view === "region" && region?.dates}
              {view === "trip" && tellurideTripPlan.dates}
            </p>
          </div>
        </div>
      </div>

      {/* National View */}
      {view === "national" && (
        <div className="px-4 md:px-6 lg:px-8 py-3 lg:py-4 space-y-3 lg:space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 dark:border-slate-700 px-4 md:px-5 lg:px-6 py-3">
            <h3 className="text-xs lg:text-sm font-bold tracking-wide text-gray-500 dark:text-slate-400 dark:text-slate-400 mb-1">
              NEXT 10 DAYS — WHERE&apos;S THE SNOW?
            </h3>
            <p className="text-[10px] lg:text-xs text-gray-400 dark:text-slate-500">Tap a region for resort-level detail</p>
          </div>

          {/* Region cards — 2-col on tablet, 3-col on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-3">
            {chaseRegions.map((r) => {
              const config = severityConfig[r.severity] ?? defaultSeverityConfig;
              return (
                <button
                  key={r.id}
                  onClick={() => {
                    log("chase.region_select", { regionId: String(r.id) });
                    setSelectedRegion(r.id);
                    setView("region");
                  }}
                  className={`w-full text-left rounded-xl border ${config.border} ${config.bg} px-4 md:px-5 lg:px-6 py-3 lg:py-4 transition-all hover:shadow-md`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {config.icon && <span className="text-sm">{config.icon}</span>}
                        <span className={`text-[10px] lg:text-xs font-bold tracking-wide ${config.text}`}>
                          {config.label}
                        </span>
                      </div>
                      <div className="text-sm lg:text-base font-semibold text-gray-900 dark:text-white">{r.name}</div>
                      <div className="text-xs lg:text-sm text-gray-600 dark:text-slate-300 mt-0.5">{r.description}</div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <div className={`text-sm lg:text-base font-bold ${r.severity !== "quiet" ? "text-blue-600" : "text-gray-400"}`}>
                        {r.forecastTotal}
                      </div>
                      {r.dates && (
                        <div className="text-[10px] lg:text-xs text-gray-500 dark:text-slate-400">{r.dates}</div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Chase alert callout */}
          <div className="bg-red-50 dark:bg-red-900/30 rounded-xl border border-red-200 dark:border-red-700 px-4 md:px-5 lg:px-6 py-3 lg:py-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">🔴</span>
              <span className="text-xs lg:text-sm font-bold text-red-800 dark:text-red-300">CHASE ALERT</span>
            </div>
            <p className="text-xs lg:text-sm text-red-700 dark:text-red-200">
              Southern Colorado, Feb 10-13. This is chase-worthy from the East Coast.
            </p>
            <button
              onClick={() => { log("chase.alert_cta_click"); setView("trip"); }}
              className="mt-2 text-xs lg:text-sm font-semibold text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100"
            >
              See flight + logistics breakdown →
            </button>
          </div>
        </div>
      )}

      {/* Region View */}
      {view === "region" && region && (
        <div className="px-4 md:px-6 lg:px-8 py-3 lg:py-4 space-y-3 lg:space-y-4">
          {/* Region forecast header */}
          <div className={`rounded-xl border ${(severityConfig[region.severity] ?? defaultSeverityConfig).border} ${(severityConfig[region.severity] ?? defaultSeverityConfig).bg} px-4 md:px-5 lg:px-6 py-3 lg:py-4`}>
            <div className="flex items-center gap-2 mb-2">
              <span>{(severityConfig[region.severity] ?? defaultSeverityConfig).icon}</span>
              <span className={`text-xs lg:text-sm font-bold ${(severityConfig[region.severity] ?? defaultSeverityConfig).text}`}>
                {region.dates} STORM
              </span>
            </div>
            <p className="text-xs lg:text-sm text-gray-700 dark:text-slate-300">{region.description}</p>
          </div>

          {/* Resort ranking */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="px-4 md:px-5 lg:px-6 py-2.5 border-b border-gray-100 dark:border-slate-700">
              <h3 className="text-xs lg:text-sm font-bold tracking-wide text-gray-500 dark:text-slate-400">
                FORECAST TOTALS ({region.dates})
              </h3>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-slate-700">
              {[
                { name: "Silverton", total: "24-30\"", note: "Expert only, heli/cat", pass: "independent" },
                { name: "Wolf Creek", total: "22-28\"", note: "No lodging at base", pass: "independent" },
                { name: "Telluride", total: "18-24\"", note: "Best town + terrain combo", pass: "ikon" },
                { name: "Crested Butte", total: "15-20\"", note: "Epic pass", pass: "epic" },
                { name: "Purgatory", total: "12-16\"", note: "Family-friendly", pass: "epic" },
                { name: "Monarch", total: "14-18\"", note: "Budget ($59), no-frills", pass: "independent" },
              ].map((r, i) => (
                <div key={r.name} className="px-4 md:px-5 lg:px-6 py-2.5 lg:py-3 flex items-center gap-3">
                  <span className="text-sm lg:text-base w-5 text-center">
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : ""}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm lg:text-base font-semibold text-gray-900 dark:text-white">{r.name}</span>
                      {r.pass === "ikon" && (
                        <span className="text-[10px] lg:text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                          IKON
                        </span>
                      )}
                      {r.pass === "epic" && (
                        <span className="text-[10px] lg:text-xs px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-medium">
                          EPIC
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] lg:text-xs text-gray-500 dark:text-slate-400">{r.note}</div>
                  </div>
                  <span className="text-sm lg:text-base font-bold text-blue-600 tabular-nums">{r.total}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pass recommendations */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 px-4 md:px-5 lg:px-6 py-3 lg:py-4 space-y-3">
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] lg:text-xs font-bold text-orange-700 bg-orange-100 px-1.5 py-0.5 rounded">
                  FOR IKON
                </span>
              </div>
              <p className="text-xs lg:text-sm text-gray-700 dark:text-slate-300">
                Best option: <strong>Telluride (18-24&quot;)</strong>. Great town for 2-3 nights.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] lg:text-xs font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded">
                  FOR EPIC
                </span>
              </div>
              <p className="text-xs lg:text-sm text-gray-700 dark:text-slate-300">
                Best option: <strong>Crested Butte (15-20&quot;)</strong>. Not as much as Telluride, but on Epic.
              </p>
            </div>
          </div>

          {/* CTA to trip plan */}
          <button
            onClick={() => { log("chase.build_trip_click"); setView("trip"); }}
            className="w-full py-3 bg-red-600 text-white text-sm lg:text-base font-semibold rounded-xl hover:bg-red-700 transition-colors"
          >
            ✈️ Build chase trip to Telluride →
          </button>
        </div>
      )}

      {/* Trip Plan View */}
      {view === "trip" && (
        <div className="px-4 md:px-6 lg:px-8 py-3 lg:py-4 space-y-3 lg:space-y-4">
          {/* Trip header */}
          <div className="bg-red-50 dark:bg-red-900/30 rounded-xl border border-red-200 dark:border-red-700 px-4 md:px-5 lg:px-6 py-3 lg:py-4">
            <div className="flex items-center gap-2 mb-1">
              <span>✈️</span>
              <span className="text-sm lg:text-base font-bold text-gray-900 dark:text-white">
                CHASE TRIP: {tellurideTripPlan.destination}
              </span>
            </div>
            <p className="text-xs lg:text-sm text-gray-600 dark:text-red-200">
              {tellurideTripPlan.dates} · {tellurideTripPlan.nights} nights · Ikon ✓
            </p>
          </div>

          {/* Two-column layout on desktop: logistics left, ski plan right */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-4 space-y-3 lg:space-y-0">
            {/* Left column: flights, lodging, rental car */}
            <div className="space-y-3 lg:space-y-4">
              {/* Flights */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                <div className="px-4 md:px-5 lg:px-6 py-2.5 border-b border-gray-100 dark:border-slate-700">
                  <h3 className="text-xs lg:text-sm font-bold tracking-wide text-gray-500 dark:text-slate-400">FLIGHTS</h3>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-slate-700">
                  {tellurideTripPlan.flights.map((f, i) => (
                    <div key={f.route} className="px-4 md:px-5 lg:px-6 py-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm lg:text-base font-semibold text-gray-900 dark:text-white">{f.route}</span>
                        <span className={`text-sm lg:text-base font-bold ${i === 0 ? "text-green-600" : "text-gray-500 dark:text-slate-400"}`}>
                          ${f.price} RT
                        </span>
                      </div>
                      <p className="text-xs lg:text-sm text-gray-500 dark:text-slate-400">{f.details}</p>
                      {i === 0 && (
                        <div className="mt-2 flex items-center gap-1">
                          <span className="text-[10px] lg:text-xs font-medium text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                            ⚠️ Book today — will sell out
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Lodging */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                <div className="px-4 md:px-5 lg:px-6 py-2.5 border-b border-gray-100 dark:border-slate-700">
                  <h3 className="text-xs lg:text-sm font-bold tracking-wide text-gray-500 dark:text-slate-400">LODGING</h3>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-slate-700">
                  {tellurideTripPlan.lodging.map((l) => (
                    <div key={l.name} className="px-4 md:px-5 lg:px-6 py-2.5 flex items-center justify-between">
                      <div>
                        <div className="text-sm lg:text-base font-medium text-gray-900 dark:text-white">{l.name}</div>
                        <div className="text-[10px] lg:text-xs text-gray-500 dark:text-slate-400">{l.note}</div>
                      </div>
                      <span className="text-sm lg:text-base font-semibold text-gray-900 dark:text-white">${l.price}/night</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rental Car */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 px-4 md:px-5 lg:px-6 py-3">
                <h3 className="text-xs lg:text-sm font-bold tracking-wide text-gray-500 dark:text-slate-400 mb-1">
                  RENTAL CAR
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-xs lg:text-sm text-gray-600 dark:text-slate-300">{tellurideTripPlan.rentalCar.note}</span>
                  <span className="text-sm lg:text-base font-semibold text-gray-900 dark:text-white">${tellurideTripPlan.rentalCar.price}/day</span>
                </div>
              </div>
            </div>

            {/* Right column: ski plan + cost estimate */}
            <div className="space-y-3 lg:space-y-4">
              {/* Ski Plan */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                <div className="px-4 md:px-5 lg:px-6 py-2.5 border-b border-gray-100 dark:border-slate-700">
                  <h3 className="text-xs lg:text-sm font-bold tracking-wide text-gray-500 dark:text-slate-400">SKI PLAN</h3>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-slate-700">
                  {tellurideTripPlan.skiPlan.map((d, i) => (
                    <div key={d.day} className="px-4 md:px-5 lg:px-6 py-2.5">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs lg:text-sm font-semibold text-gray-900 dark:text-white">{d.day}</span>
                        {i === 1 && (
                          <span className="text-[10px] lg:text-xs font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                            POWDER DAY
                          </span>
                        )}
                      </div>
                      <p className="text-xs lg:text-sm text-gray-600 dark:text-slate-300">{d.plan}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cost Estimate */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 px-4 md:px-5 lg:px-6 py-3 lg:py-4">
                <h3 className="text-xs lg:text-sm font-bold tracking-wide text-gray-500 dark:text-slate-400 mb-3">
                  ESTIMATED TOTAL
                </h3>
                <div className="space-y-1.5 text-xs lg:text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-slate-300">Flights</span>
                    <span className="tabular-nums text-gray-900 dark:text-white">${tellurideTripPlan.flights[0].price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-slate-300">Lodging ({tellurideTripPlan.nights}n)</span>
                    <span className="tabular-nums text-gray-900 dark:text-white">${tellurideTripPlan.lodging[0].price * tellurideTripPlan.nights}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-slate-300">Rental car</span>
                    <span className="tabular-nums text-gray-900 dark:text-white">${tellurideTripPlan.rentalCar.price * (tellurideTripPlan.nights + 1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-slate-300">Lift tickets</span>
                    <span className="tabular-nums text-green-600">$0 (Ikon pass)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-slate-300">Food/misc</span>
                    <span className="tabular-nums text-gray-900 dark:text-white">~$200</span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-slate-600 pt-1.5 mt-1.5">
                    <div className="flex justify-between font-bold text-gray-900 dark:text-white">
                      <span>Total</span>
                      <span className="tabular-nums">~${tellurideTripPlan.totalWithPass.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-500 dark:text-slate-400 mt-0.5">
                      <span>Cost per powder day</span>
                      <span className="tabular-nums">~${tellurideTripPlan.costPerPowderDay}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom line — full width */}
          <div className="bg-amber-50 dark:bg-amber-900/30 rounded-xl border border-amber-200 dark:border-amber-700 px-4 md:px-5 lg:px-6 py-3 lg:py-4">
            <h3 className="text-xs lg:text-sm font-bold text-amber-800 dark:text-amber-300 mb-1">💡 BOTTOM LINE</h3>
            <p className="text-xs lg:text-sm text-amber-700 dark:text-amber-200 leading-relaxed">
              18-24&quot; at Telluride is a 2-3x per season event. Total trip cost is ~$1,200.
              You get 2 genuine powder days and 1 packed-powder day.
            </p>
            <p className="text-xs lg:text-sm text-amber-700 dark:text-amber-200 mt-2 font-semibold">
              DECISION DEADLINE: Book flights by Saturday. Prices will jump once the forecast firms up Sunday.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
