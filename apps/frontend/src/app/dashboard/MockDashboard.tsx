"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { scenarios } from "@/data/scenarios";
import { TimeWindow } from "@/data/types";
import ResortTable from "@/components/ResortTable";
import AiAnalysis from "@/components/ExpertTake";
import PromptInput from "@/components/ScenarioSwitcher";
import type { MapResort } from "@/components/ResortMap";

const ResortMap = dynamic(() => import("@/components/ResortMap"), { ssr: false });

// Always show 10-day forecast
const timeWindow: TimeWindow = "10day";

export default function MockDashboard() {
  const [activeScenarioId, setActiveScenarioId] = useState(scenarios[0].id);

  const scenario = scenarios.find((s) => s.id === activeScenarioId) || scenarios[0];

  // Get per-window data
  const windowData = scenario.timeWindows[timeWindow];
  const dateLabel = windowData.dateLabel;
  const dailyLabels = windowData.dailyLabels;
  const worthKnowing = windowData.worthKnowing ?? scenario.worthKnowing;

  // Build map data using the 10-day window
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
  }, [scenario.yourResorts, worthKnowing]);

  return (
    <div className="min-h-screen">
      {/* Prompt Input */}
      <PromptInput
        scenarios={scenarios}
        activeId={activeScenarioId}
        onChange={setActiveScenarioId}
      />

      {/* Resort Map */}
      <ResortMap resorts={mapResorts} />

      {/* Main content */}
      <div className="px-4 md:px-6 lg:px-8 py-3 lg:py-4 space-y-3 lg:space-y-4">
        {/* Your Resorts — storm banner + ranked resort list */}
        <ResortTable
          resorts={scenario.yourResorts}
          storm={scenario.stormTracker}
          timeWindow={timeWindow}
          dailyLabels={dailyLabels}
          worthKnowing={worthKnowing}
        />

        {/* AI Analysis */}
        {scenario.aiAnalysis && <AiAnalysis analysis={scenario.aiAnalysis} />}
      </div>

      {/* POC footer */}
      <div className="px-4 md:px-6 lg:px-8 py-6 text-center">
        <p className="text-[10px] text-blue-200">
          POC — OnlySnow · {scenario.name} · {dateLabel}
        </p>
      </div>
    </div>
  );
}
