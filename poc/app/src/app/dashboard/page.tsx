"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { scenarios } from "@/data/scenarios";
import ResortTable from "@/components/ResortTable";
import AiAnalysis from "@/components/ExpertTake";
import PromptInput from "@/components/ScenarioSwitcher";
import type { MapResort } from "@/components/ResortMap";

const ResortMap = dynamic(() => import("@/components/ResortMap"), { ssr: false });

export default function DashboardPage() {
  const [activeScenarioId, setActiveScenarioId] = useState(scenarios[0].id);

  const scenario = scenarios.find((s) => s.id === activeScenarioId) || scenarios[0];

  // Always use 10-day view
  const windowData = scenario.timeWindows["10day"];
  const dateLabel = windowData.dateLabel;
  const dailyLabels = windowData.dailyLabels;
  // Use per-window worth knowing if defined, otherwise fall back to scenario default
  const worthKnowing = windowData.worthKnowing ?? scenario.worthKnowing;

  const mapResorts = useMemo(() => {
    const seen = new Set<string>();
    const items: MapResort[] = [];
    for (const rc of scenario.yourResorts) {
      if (seen.has(rc.resort.id)) continue;
      seen.add(rc.resort.id);
      const daily = rc.forecasts["10day"].daily;
      const sum = daily ? daily.reduce((a, b) => a + b, 0) : rc.forecasts["10day"].sort;
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
      const daily = wk.forecasts["10day"].daily;
      const sum = daily ? daily.reduce((a, b) => a + b, 0) : wk.forecasts["10day"].sort;
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
      <div className="px-4 py-3 space-y-3">
        {/* Your Resorts — storm banner + ranked resort list */}
        <ResortTable
          resorts={scenario.yourResorts}
          storm={scenario.stormTracker}
          timeWindow="10day"
          dailyLabels={dailyLabels}
          worthKnowing={worthKnowing}
        />

        {/* AI Analysis */}
        {scenario.aiAnalysis && <AiAnalysis analysis={scenario.aiAnalysis} />}
      </div>

      {/* POC footer */}
      <div className="px-4 py-6 text-center">
        <p className="text-[10px] text-blue-200">
          POC — OnlySnow · {scenario.name} · {dateLabel}
        </p>
      </div>
    </div>
  );
}
