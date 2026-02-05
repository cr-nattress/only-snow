"use client";

import Link from "next/link";
import { ResortConditions, TimeWindow, WorthKnowingEntry, StormTrackerState } from "@/data/types";
import ResortRow from "./ResortRow";

const severityStyles = {
  quiet: { bg: "bg-gray-50", border: "border-b border-gray-100", text: "text-gray-600" },
  moderate: { bg: "bg-yellow-50", border: "border-b border-yellow-200", text: "text-yellow-900" },
  significant: { bg: "bg-orange-50", border: "border-b border-orange-200", text: "text-orange-900" },
  chase: { bg: "bg-red-50", border: "border-b border-red-300", text: "text-red-900" },
};

interface ResortTableProps {
  resorts: ResortConditions[];
  storm: StormTrackerState;
  timeWindow: TimeWindow;
  dailyLabels?: string[];
  worthKnowing?: WorthKnowingEntry[];
}

export default function ResortTable({
  resorts,
  storm,
  timeWindow,
  dailyLabels,
  worthKnowing,
}: ResortTableProps) {
  // IDs of resorts already in the user's list
  const userResortIds = new Set(resorts.map((r) => r.resort.id));

  // Convert worth knowing entries that aren't already in the user's list to ResortConditions
  const extraResorts: ResortConditions[] = (worthKnowing ?? [])
    .filter((entry) => !userResortIds.has(entry.resort.id))
    .map((entry) => ({
      resort: entry.resort,
      snowfall24hr: entry.snowfall24hr,
      baseDepth: entry.baseDepth,
      openPercent: entry.openPercent,
      trailsOpen: 0,
      trailsTotal: 0,
      liftsOpen: 0,
      liftsTotal: 0,
      conditions: "",
      forecasts: entry.forecasts,
    }));

  // Combine and sort all resorts together
  const allResorts = [...resorts, ...extraResorts];
  const sorted = [...allResorts].sort((a, b) => {
    const diff = b.forecasts[timeWindow].sort - a.forecasts[timeWindow].sort;
    if (diff !== 0) return diff;
    return b.openPercent - a.openPercent;
  });

  const style = severityStyles[storm.severity];
  const isActive = storm.severity !== "quiet";

  const stormBanner = (
    <div className={`px-4 md:px-5 lg:px-6 py-2.5 lg:py-3 ${style.bg} ${style.border}`}>
      <div className="flex items-center gap-2">
        <span className={`text-[10px] lg:text-xs font-extrabold tracking-wide ${style.text}`}>STORMS</span>
        <p className={`text-xs lg:text-sm font-semibold ${style.text}`}>{storm.text}</p>
      </div>
      {storm.flightPrice && (
        <div className="mt-1 ml-12">
          <span className="text-[10px] font-bold text-red-800 bg-red-100 px-2 py-0.5 rounded-full">
            ✈️ {storm.flightPrice} RT
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Storm banner */}
      {isActive ? (
        <Link href="/chase">{stormBanner}</Link>
      ) : (
        stormBanner
      )}

      {/* Resort rows — all resorts ranked together */}
      <div className="divide-y divide-gray-200">
        {sorted.map((r, i) => (
          <div key={r.resort.id} className={i % 2 === 1 ? "bg-gray-50" : ""}>
            <ResortRow
              data={r}
              rank={i + 1}
              userPass={resorts[0]?.resort.passType || "epic"}
              timeWindow={timeWindow}
              dailyLabels={dailyLabels}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
