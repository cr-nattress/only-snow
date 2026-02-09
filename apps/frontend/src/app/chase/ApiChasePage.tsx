"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { RegionComparisonData } from "@/lib/data-provider";
import { fetchChasePageData, fetchRegionComparison } from "@/lib/data-provider";
import type { ChaseRegion, StormSeverity } from "@/data/types";
import { usePreferences } from "@/context/PreferencesContext";

const severityConfig: Partial<Record<StormSeverity, { bg: string; border: string; text: string; label: string; icon: string }>> = {
  quiet: { bg: "bg-gray-50 dark:bg-slate-700", border: "border-gray-200 dark:border-slate-600", text: "text-gray-500 dark:text-slate-400", label: "QUIET", icon: "" },
  moderate: { bg: "bg-yellow-50 dark:bg-yellow-900/30", border: "border-yellow-200 dark:border-yellow-700", text: "text-yellow-800 dark:text-yellow-300", label: "MODERATE", icon: "" },
  significant: { bg: "bg-orange-50 dark:bg-orange-900/30", border: "border-orange-200 dark:border-orange-700", text: "text-orange-800 dark:text-orange-300", label: "SIGNIFICANT", icon: "" },
  chase: { bg: "bg-red-50 dark:bg-red-900/30", border: "border-red-300 dark:border-red-700", text: "text-red-800 dark:text-red-300", label: "MAJOR EVENT", icon: "" },
};

const defaultSeverityConfig = { bg: "bg-gray-50 dark:bg-slate-700", border: "border-gray-200 dark:border-slate-600", text: "text-gray-500 dark:text-slate-400", label: "UNKNOWN", icon: "" };

const passBadge: Record<string, { bg: string; text: string; label: string }> = {
  epic: { bg: "bg-indigo-100", text: "text-indigo-700", label: "EPIC" },
  ikon: { bg: "bg-green-100", text: "text-green-700", label: "IKON" },
  indy: { bg: "bg-blue-100", text: "text-blue-700", label: "INDY" },
};

type View = "national" | "region";

function RegionCard({ region, onSelect }: { region: ChaseRegion; onSelect: (r: ChaseRegion) => void }) {
  const config = severityConfig[region.severity] ?? defaultSeverityConfig;
  return (
    <button
      onClick={() => onSelect(region)}
      className={`w-full text-left rounded-xl border ${config.border} ${config.bg} px-4 md:px-5 lg:px-6 py-3 lg:py-4 transition-all hover:shadow-md`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {config.icon && <span className="text-sm">{config.icon}</span>}
            <span className={`text-[10px] lg:text-xs font-bold tracking-wide ${config.text}`}>
              {config.label}
            </span>
            {region.driveDisplay && (
              <span className="text-[10px] lg:text-xs px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium">
                {region.driveDisplay} drive
              </span>
            )}
            {!region.driveDisplay && region.bestAirport && (
              <span className="text-[10px] lg:text-xs px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-slate-300 font-medium">
                {region.bestAirport}
              </span>
            )}
          </div>
          <div className="text-sm lg:text-base font-semibold text-gray-900 dark:text-white">{region.name}</div>
          <div className="text-xs lg:text-sm text-gray-600 dark:text-slate-300 mt-0.5">{region.description}</div>
        </div>
        <div className="text-right shrink-0 ml-4">
          <div className={`text-sm lg:text-base font-bold ${region.severity !== "quiet" ? "text-blue-600" : "text-gray-400"}`}>
            {region.forecastTotal}
          </div>
          {region.chaseScore != null && region.chaseScore > 0 && (
            <div className="text-[10px] lg:text-xs text-gray-500 dark:text-slate-400">
              score {region.chaseScore.toFixed(1)}
            </div>
          )}
          {region.dates && (
            <div className="text-[10px] lg:text-xs text-gray-500 dark:text-slate-400">{region.dates}</div>
          )}
        </div>
      </div>
    </button>
  );
}

export default function ApiChasePage() {
  const { preferences } = usePreferences();
  const [withinReach, setWithinReach] = useState<ChaseRegion[]>([]);
  const [worthTheTrip, setWorthTheTrip] = useState<ChaseRegion[]>([]);
  const [fallbackRegions, setFallbackRegions] = useState<ChaseRegion[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("national");
  const [selectedRegion, setSelectedRegion] = useState<ChaseRegion | null>(null);
  const [comparison, setComparison] = useState<RegionComparisonData | null>(null);
  const [loadingComparison, setLoadingComparison] = useState(false);

  const hasTiers = withinReach.length > 0 || worthTheTrip.length > 0;
  const isChaseUnwilling = preferences.chaseWillingness === 'no';

  const loadData = useCallback(async () => {
    setLoading(true);

    const lat = preferences.lat;
    const lng = preferences.lng;

    if (preferences.location && (!lat || !lng)) {
      console.warn('No coordinates saved for location:', preferences.location, '- showing all regions');
    }

    try {
      const data = await fetchChasePageData({
        lat,
        lng,
        chaseWillingness: preferences.chaseWillingness,
      });
      setWithinReach(data.withinReach);
      setWorthTheTrip(data.worthTheTrip);
      setFallbackRegions(data.regions);
    } catch (error) {
      console.error('Failed to load chase page data:', error);
      const data = await fetchChasePageData();
      setFallbackRegions(data.regions);
      setWithinReach([]);
      setWorthTheTrip([]);
    } finally {
      setLoading(false);
    }
  }, [preferences.location, preferences.lat, preferences.lng, preferences.chaseWillingness]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  const handleSelectRegion = (r: ChaseRegion) => {
    setSelectedRegion(r);
    setView("region");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 dark:text-slate-400">Loading storm data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-4 md:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-3">
          {view === "national" ? (
            <Link href="/dashboard" className="text-white/70 hover:text-white">
              &larr;
            </Link>
          ) : (
            <button
              onClick={() => setView("national")}
              className="text-white/70 hover:text-white"
            >
              &larr;
            </button>
          )}
          <div>
            <h1 className="text-lg lg:text-xl font-bold text-white">
              {view === "national" ? "Storm Tracker" : selectedRegion?.name}
            </h1>
            <p className="text-xs lg:text-sm text-blue-100 dark:text-slate-400">
              {view === "national"
                ? preferences.location
                  ? `Near ${preferences.location} · Next 10 Days`
                  : "National Overview · Next 10 Days"
                : selectedRegion?.dates}
            </p>
          </div>
        </div>
      </div>

      {/* Chase Unwilling Prompt */}
      {view === "national" && isChaseUnwilling && (
        <div className="px-4 md:px-6 lg:px-8 py-3 lg:py-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 px-4 md:px-5 lg:px-6 py-6 text-center">
            <p className="text-sm text-gray-600 dark:text-slate-300 mb-2">
              Storm chasing is disabled in your settings.
            </p>
            <Link
              href="/settings"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Update chase preferences
            </Link>
          </div>
        </div>
      )}

      {/* National View */}
      {view === "national" && !isChaseUnwilling && (
        <div className="px-4 md:px-6 lg:px-8 py-3 lg:py-4 space-y-3 lg:space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 px-4 md:px-5 lg:px-6 py-3">
            <h3 className="text-xs lg:text-sm font-bold tracking-wide text-gray-500 dark:text-slate-400 mb-1">
              NEXT 10 DAYS &mdash; WHERE&apos;S THE SNOW?
            </h3>
            <p className="text-[10px] lg:text-xs text-gray-400 dark:text-slate-500">Tap a region for resort-level detail</p>
          </div>

          {hasTiers ? (
            <>
              {/* Tier 1: Within Reach */}
              {withinReach.length > 0 && (
                <div className="space-y-2 lg:space-y-3">
                  <h3 className="text-xs lg:text-sm font-bold tracking-wide text-white/80 px-1">
                    WITHIN REACH
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-3">
                    {withinReach.map((r) => (
                      <RegionCard key={r.id} region={r} onSelect={handleSelectRegion} />
                    ))}
                  </div>
                </div>
              )}

              {/* Tier 2: Worth the Trip */}
              {worthTheTrip.length > 0 && (
                <div className="space-y-2 lg:space-y-3">
                  <h3 className="text-xs lg:text-sm font-bold tracking-wide text-white/80 px-1">
                    WORTH THE TRIP
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-3">
                    {worthTheTrip.map((r) => (
                      <RegionCard key={r.id} region={r} onSelect={handleSelectRegion} />
                    ))}
                  </div>
                </div>
              )}

              {withinReach.length === 0 && worthTheTrip.length === 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 px-4 md:px-5 lg:px-6 py-8 text-center">
                  <p className="text-sm text-gray-500 dark:text-slate-400">No significant storms in the forecast.</p>
                </div>
              )}
            </>
          ) : (
            /* Fallback: flat list when no drive data available */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-3">
              {fallbackRegions.map((r) => (
                <RegionCard key={r.id} region={r} onSelect={handleSelectRegion} />
              ))}
            </div>
          )}
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
              {selectedRegion.driveDisplay && (
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium">
                  {selectedRegion.driveDisplay} drive
                </span>
              )}
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
                        {i === 0 ? "\u{1F947}" : i === 1 ? "\u{1F948}" : i === 2 ? "\u{1F949}" : ""}
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
