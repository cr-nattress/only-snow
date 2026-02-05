"use client";

import { WorthKnowingEntry, TimeWindow } from "@/data/types";

interface WorthKnowingProps {
  entries: WorthKnowingEntry[];
  timeWindow: TimeWindow;
}

const columnLabels: Record<TimeWindow, string> = {
  "5day": "5 day",
  "10day": "10 day",
};

export default function WorthKnowing({ entries, timeWindow }: WorthKnowingProps) {
  if (entries.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-amber-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 md:px-5 lg:px-6 py-2.5 lg:py-3 bg-amber-50 border-b border-amber-100">
        <h2 className="font-bold text-sm lg:text-base tracking-wide text-amber-800 flex items-center gap-1.5">
          <span>💡</span>
          <span>WORTH KNOWING</span>
        </h2>
      </div>

      {/* Entries */}
      <div className="divide-y divide-gray-100">
        {entries.map((entry) => {
          const forecast = entry.forecasts[timeWindow];
          const hasSnow = forecast.sort > 0;

          return (
            <div key={entry.resort.id} className="px-4 md:px-5 lg:px-6 py-3 lg:py-4">
              {/* Resort row */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm lg:text-base">{entry.resort.name}</span>
                  {entry.walkUpPrice > 0 ? (
                    <span className="text-[10px] lg:text-xs font-medium px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      ${entry.walkUpPrice}
                    </span>
                  ) : (
                    <span className="text-[10px] lg:text-xs font-medium px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
                      ON PASS
                    </span>
                  )}
                </div>
                <span className="text-xs lg:text-sm text-gray-500">{entry.resort.driveTime}</span>
              </div>

              {/* Stats row */}
              <div className="flex gap-4 lg:gap-6 mb-2 text-xs lg:text-sm">
                <div>
                  <span className={`font-bold ${hasSnow ? "text-blue-600" : "text-gray-400"}`}>
                    {forecast.display}
                  </span>
                  <span className="text-gray-400 ml-1">{columnLabels[timeWindow]}</span>
                </div>
                <div>
                  <span className="text-gray-600">{entry.baseDepth}&quot;</span>
                  <span className="text-gray-400 ml-1">base</span>
                </div>
                <div>
                  <span className="text-gray-600">{entry.openPercent}%</span>
                  <span className="text-gray-400 ml-1">open</span>
                </div>
              </div>

              {/* Reason */}
              <p className="text-xs lg:text-sm text-gray-600 leading-relaxed">{entry.reason}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
