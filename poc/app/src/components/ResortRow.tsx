"use client";

import Link from "next/link";
import { ResortConditions, TimeWindow } from "@/data/types";
import { useResortRow } from "@/hooks/useResortRow";

interface ResortRowProps {
  data: ResortConditions;
  rank: number;
  userPass: string;
  timeWindow: TimeWindow;
  dailyLabels?: string[];
}

export default function ResortRow({ data, rank, userPass, timeWindow, dailyLabels }: ResortRowProps) {
  const row = useResortRow(data, userPass, timeWindow);

  return (
    <Link href={`/resort/${row.resortId}`} className="block">
      <div className="resort-row px-4 md:px-5 lg:px-6 py-3 lg:py-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors">
        {/* Resort summary row */}
        <div className="flex items-center gap-3">
          {/* Weather icon */}
          <div className={`w-8 h-8 lg:w-10 lg:h-10 shrink-0 rounded-full ${row.weather.bg} ring-2 ${row.weather.ring} flex items-center justify-center`}>
            <span className="text-lg lg:text-xl leading-none">{row.weather.icon}</span>
          </div>

          {/* Resort name + pass badge */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm lg:text-base truncate text-gray-900">{row.resortName}</span>
              {row.onPass && (
                <span className="text-[10px] lg:text-xs font-bold px-1.5 py-0.5 rounded-full bg-green-100 text-green-800 shrink-0">
                  {row.passType.toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {/* Data columns — visible on all sizes */}
          <div className="flex items-center gap-3 lg:gap-5 shrink-0 text-right">
            {/* 24hr snowfall */}
            <div className="w-10 lg:w-12">
              <div className={`text-sm lg:text-base font-extrabold tabular-nums ${row.has24hrSnow ? "text-blue-700" : "text-gray-300"}`}>
                {row.snowfall24hrDisplay}
              </div>
              <div className="text-[10px] lg:text-xs font-semibold text-gray-500">24hr</div>
            </div>

            {/* Aggregate forecast — only when no daily breakdown */}
            {!row.daily && (
              <div className="w-12 lg:w-14">
                <div className={`text-sm lg:text-base font-extrabold tabular-nums ${row.hasSnow ? "text-blue-700" : "text-gray-300"}`}>
                  {row.forecastDisplay}
                </div>
                <div className="text-[10px] lg:text-xs font-semibold text-gray-500">{timeWindow === "5day" ? "5 day" : "10 day"}</div>
              </div>
            )}

            {/* Base */}
            <div className="w-10 lg:w-12">
              <div className="text-sm lg:text-base font-bold tabular-nums text-gray-800">{row.baseDepth}&quot;</div>
              <div className="text-[10px] lg:text-xs font-semibold text-gray-500">base</div>
            </div>

            {/* Open % */}
            <div className="w-10 lg:w-12">
              <div className="text-sm lg:text-base font-bold tabular-nums text-gray-800">{row.openPercent}%</div>
              <div className="text-[10px] lg:text-xs font-semibold text-gray-500">open</div>
            </div>
          </div>
        </div>

        {/* Daily forecast breakdown */}
        {row.daily && (
          <div className="mt-2 ml-11 lg:ml-13">
            {/* Day labels */}
            {dailyLabels && (
              <div className="flex gap-0.5 lg:gap-1 mb-1">
                {dailyLabels.map((label, i) => (
                  <div key={i} className="flex-1 text-center">
                    <span className="text-[10px] lg:text-xs font-bold text-gray-500 uppercase">{label}</span>
                  </div>
                ))}
              </div>
            )}
            {/* Snowfall cells */}
            <div className="flex gap-0.5 lg:gap-1">
              {row.daily.map((inches, i) => (
                <div
                  key={i}
                  className={`flex-1 text-center py-1 lg:py-1.5 rounded ${
                    inches > 0 ? "bg-blue-50" : "bg-gray-50"
                  }`}
                >
                  <div className={`text-xs lg:text-sm font-extrabold tabular-nums ${inches > 0 ? "text-blue-700" : "text-gray-300"}`}>
                    {inches > 0 ? `${inches}"` : "—"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
