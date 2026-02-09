"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { fetchDashboardData } from "@/lib/data-provider";
import type { DashboardData } from "@/lib/data-provider";
import type { UserLocation } from "@/components/ResortMap";
import ResortTable from "@/components/ResortTable";
import AiAnalysis from "@/components/ExpertTake";
import { usePreferences } from "@/context/PreferencesContext";
import { driveMinutesToMiles } from "@/lib/geocode";
import { useLoadingTimeout } from "@/hooks/useLoadingTimeout";

const ResortMap = dynamic(() => import("@/components/ResortMap"), { ssr: false });

export default function ApiDashboard() {
  const { preferences } = usePreferences();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | undefined>();
  const { isTimedOut } = useLoadingTimeout(loading);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(false);

    // Use stored coordinates from onboarding (no geocoding needed)
    let lat = preferences.lat;
    let lng = preferences.lng;
    let radiusMiles: number | undefined;

    if (preferences.location && lat && lng) {
      radiusMiles = driveMinutesToMiles(preferences.driveRadius);
      setUserLocation({
        location: preferences.location,
        lat,
        lng,
        driveRadiusMiles: radiusMiles,
      });
    } else if (preferences.location && (!lat || !lng)) {
      console.warn('No coordinates saved for location:', preferences.location, '- location filtering disabled');
    }

    try {
      const result = await fetchDashboardData({
        lat,
        lng,
        radiusMiles,
        passType: preferences.passType && preferences.passType !== "none" && preferences.passType !== "multi"
          ? preferences.passType
          : undefined,
      });
      setData(result);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      try {
        const result = await fetchDashboardData();
        setData(result);
      } catch {
        setError(true);
      }
    } finally {
      setLoading(false);
    }
  }, [preferences.location, preferences.lat, preferences.lng, preferences.driveRadius, preferences.passType]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (error || (loading && isTimedOut)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center px-6">
          <p className="text-sm text-gray-600 dark:text-slate-300">
            Having trouble loading. Check your connection or try again.
          </p>
          <button
            onClick={loadData}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 dark:text-slate-400">Loading your resorts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Resort Map */}
      <ResortMap resorts={data.mapResorts.slice(0, 5)} userLocation={userLocation} />

      {/* Main content */}
      <div className="px-4 md:px-6 lg:px-8 py-3 lg:py-4 space-y-3 lg:space-y-4">
        {/* Recommendation banner */}
        {data.recommendation.onPass && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 px-4 md:px-5 lg:px-6 py-3">
            <h3 className="text-xs lg:text-sm font-bold tracking-wide text-gray-500 dark:text-slate-400 mb-1">
              ON YOUR PASS
            </h3>
            <p className="text-sm lg:text-base text-gray-800 dark:text-gray-200">
              {data.recommendation.onPass}
            </p>
          </div>
        )}

        {/* Resort table with storm tracker — show top 5 */}
        <ResortTable
          resorts={data.resorts.slice(0, 5)}
          storm={data.stormTracker}
          timeWindow="10day"
        />

        {/* AI Analysis */}
        {data.aiAnalysis && <AiAnalysis analysis={data.aiAnalysis} />}
      </div>

      {/* Footer */}
      <div className="px-4 md:px-6 lg:px-8 py-6 text-center">
        <p className="text-[10px] text-blue-200">
          OnlySnow · {data.dateLabel}
        </p>
      </div>
    </div>
  );
}
