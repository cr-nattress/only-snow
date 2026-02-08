"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { scenarios } from "@/data/scenarios";
import { TimeWindow } from "@/data/types";
import ResortTable from "@/components/ResortTable";
import AiAnalysis from "@/components/ExpertTake";
import PromptInput from "@/components/ScenarioSwitcher";
import TimeToggle from "@/components/TimeToggle";
import { usePreferences } from "@/context/PreferencesContext";
import type { MapResort, UserLocation } from "@/components/ResortMap";
import { geocodeLocation, driveMinutesToMiles } from "@/lib/geocode";

const ResortMap = dynamic(() => import("@/components/ResortMap"), { ssr: false });

export default function MockDashboard() {
  const router = useRouter();
  const { loaded, hasPreferences, preferences } = usePreferences();
  const [activeScenarioId, setActiveScenarioId] = useState(scenarios[0].id);
  const [hasAutoSelected, setHasAutoSelected] = useState(false);
  const [timeWindow, setTimeWindow] = useState<TimeWindow>("5day");
  const [userLocation, setUserLocation] = useState<UserLocation | undefined>();

  useEffect(() => {
    if (loaded && !hasPreferences) {
      router.replace("/onboarding");
    }
  }, [loaded, hasPreferences, router]);

  // Auto-select best matching scenario based on user preferences
  useEffect(() => {
    if (!loaded || hasAutoSelected) return;
    const userPass = preferences.passType?.toLowerCase() || "";
    const userLoc = preferences.location?.toLowerCase() || "";

    // Score each scenario by pass + location match
    let best = scenarios[0];
    let bestScore = -1;
    for (const s of scenarios) {
      let score = 0;
      if (userPass && s.pass === userPass) score += 2;
      if (userLoc && s.location.toLowerCase().includes(userLoc.split(",")[0].trim().toLowerCase())) score += 3;
      if (score > bestScore) {
        bestScore = score;
        best = s;
      }
    }
    setActiveScenarioId(best.id);
    setHasAutoSelected(true);
  }, [loaded, hasAutoSelected, preferences.passType, preferences.location]);

  // Geocode user location on mount
  useEffect(() => {
    async function loadUserLocation() {
      if (!preferences.location) return;

      const coords = await geocodeLocation(preferences.location);
      if (!coords) return;

      setUserLocation({
        location: preferences.location,
        lat: coords.lat,
        lng: coords.lng,
        driveRadiusMiles: driveMinutesToMiles(preferences.driveRadius),
      });
    }

    loadUserLocation();
  }, [preferences.location, preferences.driveRadius]);

  const scenario = scenarios.find((s) => s.id === activeScenarioId) || scenarios[0];

  // Get per-window data with dynamic date labels
  const windowData = scenario.timeWindows[timeWindow];
  // Compute date label and day labels dynamically from today
  const { dateLabel, dynamicDailyLabels } = useMemo(() => {
    const now = new Date();
    const days = timeWindow === "5day" ? 5 : 10;
    const end = new Date(now);
    end.setDate(end.getDate() + days - 1);
    const fmt = (d: Date) =>
      d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const dayFmt = (d: Date) =>
      d.toLocaleDateString("en-US", { weekday: "short" });
    const labels: string[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      labels.push(dayFmt(d));
    }
    return {
      dateLabel: `Next ${days} Days \u00B7 ${fmt(now)}\u2013${fmt(end)}`,
      dynamicDailyLabels: labels,
    };
  }, [timeWindow]);
  const worthKnowing = windowData.worthKnowing ?? scenario.worthKnowing;

  // Build map data using the selected time window
  const mapResorts = useMemo(() => {
    const seen = new Set<string>();
    const items: MapResort[] = [];
    for (const rc of scenario.yourResorts) {
      if (seen.has(rc.resort.id)) continue;
      seen.add(rc.resort.id);
      const daily = rc.forecasts[timeWindow].daily;
      const sum = daily ? daily.reduce((a, b) => a + b, 0) : rc.forecasts[timeWindow].sort;
      items.push({
        id: rc.resort.id,
        name: rc.resort.name,
        lat: rc.resort.lat,
        lng: rc.resort.lng,
        snowfallTotal: sum,
        snowfallDisplay: `${sum}"`,
      });
    }
    for (const wk of worthKnowing) {
      if (seen.has(wk.resort.id)) continue;
      seen.add(wk.resort.id);
      const daily = wk.forecasts[timeWindow].daily;
      const sum = daily ? daily.reduce((a, b) => a + b, 0) : wk.forecasts[timeWindow].sort;
      items.push({
        id: wk.resort.id,
        name: wk.resort.name,
        lat: wk.resort.lat,
        lng: wk.resort.lng,
        snowfallTotal: sum,
        snowfallDisplay: `${sum}"`,
      });
    }
    return items;
  }, [scenario.yourResorts, worthKnowing, timeWindow]);

  return (
    <div className="min-h-screen">
      {/* Prompt Input */}
      <PromptInput
        scenarios={scenarios}
        activeId={activeScenarioId}
        onChange={setActiveScenarioId}
      />

      {/* Time Window Toggle */}
      <div className="px-4 md:px-6 lg:px-8 py-2 flex items-center justify-between">
        <span className="text-xs lg:text-sm text-blue-100 dark:text-slate-400">{dateLabel}</span>
        <TimeToggle active={timeWindow} onChange={setTimeWindow} />
      </div>

      {/* Resort Map */}
      <ResortMap resorts={mapResorts} userLocation={userLocation} />

      {/* Main content */}
      <div className="px-4 md:px-6 lg:px-8 py-3 lg:py-4 space-y-3 lg:space-y-4">
        {/* Your Resorts — storm banner + ranked resort list */}
        <ResortTable
          resorts={scenario.yourResorts}
          storm={scenario.stormTracker}
          timeWindow={timeWindow}
          dailyLabels={dynamicDailyLabels}
          worthKnowing={worthKnowing}
        />

        {/* AI Analysis */}
        {scenario.aiAnalysis && <AiAnalysis analysis={scenario.aiAnalysis} />}
      </div>

    </div>
  );
}
