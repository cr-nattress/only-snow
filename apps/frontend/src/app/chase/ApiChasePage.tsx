"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { ChasePageData, RegionComparisonData } from "@/lib/data-provider";
import { fetchRegionComparison } from "@/lib/data-provider";
import type { ChaseRegion, StormSeverity } from "@/data/types";

const severityConfig: Partial<Record<StormSeverity, { bg: string; border: string; text: string; label: string; icon: string }>> = {
  quiet: { bg: "bg-gray-50 dark:bg-slate-700", border: "border-gray-200 dark:border-slate-600", text: "text-gray-500 dark:text-slate-400", label: "QUIET", icon: "" },
  moderate: { bg: "bg-yellow-50 dark:bg-yellow-900/30", border: "border-yellow-200 dark:border-yellow-700", text: "text-yellow-800 dark:text-yellow-300", label: "MODERATE", icon: "🟡" },
  significant: { bg: "bg-orange-50 dark:bg-orange-900/30", border: "border-orange-200 dark:border-orange-700", text: "text-orange-800 dark:text-orange-300", label: "SIGNIFICANT", icon: "🟠" },
  chase: { bg: "bg-red-50 dark:bg-red-900/30", border: "border-red-300 dark:border-red-700", text: "text-red-800 dark:text-red-300", label: "MAJOR EVENT", icon: "🔴" },
};

const defaultSeverityConfig = { bg: "bg-gray-50 dark:bg-slate-700", border: "border-gray-200 dark:border-slate-600", text: "text-gray-500 dark:text-slate-400", label: "UNKNOWN", icon: "" };

const passBadge: Record<string, { bg: string; text: string; label: string }> = {
  epic: { bg: "bg-indigo-100", text: "text-indigo-700", label: "EPIC" },
  ikon: { bg: "bg-green-100", text: "text-green-700", label: "IKON" },
  indy: { bg: "bg-blue-100", text: "text-blue-700", label: "INDY" },
};

type View = "national" | "region";

interface ApiChasePageProps {
  data: ChasePageData;
}

export default function ApiChasePage({ data }: ApiChasePageProps) {
  const [view, setView] = useState<View>("national");
  const [selectedRegion, setSelectedRegion] = useState<ChaseRegion | null>(null);
  const [comparison, setComparison] = useState<RegionComparisonData | null>(null);
  const [loadingComparison, setLoadingComparison] = useState(false);

  useEffect(() => {
    if (view === "region" && selectedRegion) {
      setLoadingComparison(true);
      setComparison(null);
      fetchRegionComparison(Number(selectedRegion.id))
        .then(setComparison)
        .catch(() => setComparison(null))
        .finally(() => setLoadingComparison(false));
    }
  }, [view, selectedRegion]);

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
              onClick={() => setView("national")}
              className="text-white/70 hover:text-white"
            >
              ←
            </button>
          )}
          <div>
            <h1 className="text-lg lg:text-xl font-bold text-white">
              {view === "national" ? "Storm Tracker" : selectedRegion?.name}
            </h1>
            <p className="text-xs lg:text-sm text-blue-100 dark:text-slate-400">
              {view === "national" ? "National Overview · Next 10 Days" : selectedRegion?.dates}
            </p>
          </div>
        </div>
      </div>

      {/* National View */}
      {view === "national" && (
        <div className="px-4 md:px-6 lg:px-8 py-3 lg:py-4 space-y-3 lg:space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 px-4 md:px-5 lg:px-6 py-3">
            <h3 className="text-xs lg:text-sm font-bold tracking-wide text-gray-500 dark:text-slate-400 mb-1">
              NEXT 10 DAYS — WHERE&apos;S THE SNOW?
            </h3>
            <p className="text-[10px] lg:text-xs text-gray-400 dark:text-slate-500">Tap a region for resort-level detail</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-3">
            {data.regions.map((r) => {
              const config = severityConfig[r.severity] ?? defaultSeverityConfig;
              return (
                <button
                  key={r.id}
                  onClick={() => {
                    setSelectedRegion(r);
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
        </div>
      )}

      {/* Region View */}
      {view === "region" && selectedRegion && (
        <div className="px-4 md:px-6 lg:px-8 py-3 lg:py-4 space-y-3 lg:space-y-4">
          {/* Region forecast header */}
          <div className={`rounded-xl border ${(severityConfig[selectedRegion.severity] ?? defaultSeverityConfig).border} ${(severityConfig[selectedRegion.severity] ?? defaultSeverityConfig).bg} px-4 md:px-5 lg:px-6 py-3 lg:py-4`}>
            <div className="flex items-center gap-2 mb-2">
              <span>{(severityConfig[selectedRegion.severity] ?? defaultSeverityConfig).icon}</span>
              <span className={`text-xs lg:text-sm font-bold ${(severityConfig[selectedRegion.severity] ?? defaultSeverityConfig).text}`}>
                {selectedRegion.forecastTotal} FORECAST
              </span>
            </div>
            <p className="text-xs lg:text-sm text-gray-700 dark:text-slate-300">{selectedRegion.description}</p>
          </div>

          {/* Resort comparison */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="px-4 md:px-5 lg:px-6 py-2.5 border-b border-gray-100 dark:border-slate-700">
              <h3 className="text-xs lg:text-sm font-bold tracking-wide text-gray-500 dark:text-slate-400">
                RESORTS IN {selectedRegion.name.toUpperCase()}
              </h3>
            </div>

            {loadingComparison && (
              <div className="px-4 md:px-5 lg:px-6 py-8 text-center">
                <p className="text-sm text-gray-500 dark:text-slate-400">Loading resort data...</p>
              </div>
            )}

            {!loadingComparison && comparison && (
              <div className="divide-y divide-gray-50 dark:divide-slate-700">
                {comparison.resorts.map((r, i) => {
                  const badge = passBadge[r.passType];
                  return (
                    <div key={r.name} className="px-4 md:px-5 lg:px-6 py-2.5 lg:py-3 flex items-center gap-3">
                      <span className="text-sm lg:text-base w-5 text-center">
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : ""}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm lg:text-base font-semibold text-gray-900 dark:text-white">{r.name}</span>
                          {badge && (
                            <span className={`text-[10px] lg:text-xs px-1.5 py-0.5 rounded-full ${badge.bg} ${badge.text} font-medium`}>
                              {badge.label}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] lg:text-xs text-gray-500 dark:text-slate-400">
                          Base: {r.baseDepth} · Lifts: {r.liftsOpen} · {r.conditions}
                        </div>
                      </div>
                      <span className="text-sm lg:text-base font-bold text-blue-600 tabular-nums">{r.snowfall5Day}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {!loadingComparison && !comparison && (
              <div className="px-4 md:px-5 lg:px-6 py-8 text-center">
                <p className="text-sm text-gray-500 dark:text-slate-400">Unable to load resort comparison.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-4 md:px-6 lg:px-8 py-6 text-center">
        <p className="text-[10px] lg:text-xs text-blue-200 dark:text-slate-500">OnlySnow · Storm Chase</p>
      </div>
    </div>
  );
}
