"use client";

import Link from "next/link";
import { vailDetail, vailForecast } from "@/data/scenarios";
import { resorts } from "@/data/resorts";
import { DailyForecast } from "@/data/types";
import { log } from "@/lib/log";

function ForecastBar({ day, maxSnow }: { day: DailyForecast; maxSnow: number }) {
  const height = maxSnow > 0 ? Math.max((day.snowfall / maxSnow) * 64, day.snowfall > 0 ? 8 : 0) : 0;
  const hasSnow = day.snowfall > 0;

  return (
    <div className="flex flex-col items-center gap-1 flex-1">
      <span className={`text-[10px] lg:text-xs font-bold tabular-nums ${hasSnow ? "text-blue-600 dark:text-blue-400" : "text-gray-300 dark:text-slate-600"}`}>
        {day.snowfall > 0 ? `${day.snowfall}"` : "\u2014"}
      </span>
      <div className="w-full flex items-end justify-center h-16 lg:h-20">
        <div
          className={`w-5 lg:w-7 rounded-t transition-all ${hasSnow ? "bg-blue-500" : "bg-gray-100 dark:bg-slate-700"}`}
          style={{ height: `${height}px` }}
        />
      </div>
      <span className="text-sm lg:text-base">
        {day.icon === "heavy-snow" && "\uD83C\uDF28\uFE0F"}
        {day.icon === "snow" && "\u2744\uFE0F"}
        {day.icon === "cloudy" && "\u2601\uFE0F"}
        {day.icon === "partly-cloudy" && "\u26C5"}
        {day.icon === "sunny" && "\u2600\uFE0F"}
      </span>
      <div className="text-center">
        <div className="text-[10px] lg:text-xs text-gray-700 dark:text-slate-300 font-medium">{day.tempHigh}&deg;</div>
        <div className="text-[10px] lg:text-xs text-gray-400 dark:text-slate-500">{day.tempLow}&deg;</div>
      </div>
      <div className="text-[10px] lg:text-xs font-medium text-gray-500 dark:text-slate-400">{day.day}</div>
    </div>
  );
}

export default function MockResortDetail({ id }: { id: string }) {
  const resort = Object.values(resorts).find((r) => r.id === id);
  const detail = vailDetail;
  const forecast = vailForecast;
  const maxSnow = Math.max(...forecast.map((d) => d.snowfall));

  if (!resort) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 dark:text-slate-400">Resort not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-4 md:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-white/70 hover:text-white" onClick={() => log("resort.back_click")}>
            &larr;
          </Link>
          <div className="flex-1">
            <h1 className="text-lg lg:text-xl font-bold text-white">{resort.name}</h1>
            <p className="text-xs lg:text-sm text-blue-100 dark:text-slate-400">
              {resort.region} &middot; {resort.driveTime} &middot; Next 10 Days
            </p>
          </div>
          <span className="text-[10px] lg:text-xs font-medium px-2 py-1 rounded-full bg-white/20 text-white">
            {resort.passType.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Context banner */}
      {detail.contextBanner && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border-b border-blue-100 dark:border-blue-800 px-4 md:px-6 lg:px-8 py-2">
          <p className="text-xs lg:text-sm text-blue-800 dark:text-blue-200 font-medium">{detail.contextBanner}</p>
        </div>
      )}

      <div className="px-4 md:px-6 lg:px-8 py-3 lg:py-4 space-y-3 lg:space-y-4">
        {/* Resort status bar */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 px-4 md:px-5 lg:px-6 py-3 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 lg:gap-6 text-xs lg:text-sm">
              <div>
                <span className="font-bold text-gray-900 dark:text-white">{detail.conditions.openPercent}%</span>
                <span className="text-gray-500 dark:text-slate-400 ml-1">open</span>
              </div>
              <div>
                <span className="text-gray-700 dark:text-slate-300">
                  {detail.conditions.trailsOpen}/{detail.conditions.trailsTotal}
                </span>
                <span className="text-gray-500 dark:text-slate-400 ml-1">trails</span>
              </div>
              <div>
                <span className="text-gray-700 dark:text-slate-300">
                  {detail.conditions.liftsOpen}/{detail.conditions.liftsTotal}
                </span>
                <span className="text-gray-500 dark:text-slate-400 ml-1">lifts</span>
              </div>
            </div>
            <span className="text-xs lg:text-sm font-medium text-gray-500 dark:text-slate-400">
              {detail.conditions.conditions}
            </span>
          </div>
        </div>

        {/* Two-column layout on desktop */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-4 space-y-3 lg:space-y-0">
          {/* Left column */}
          <div className="space-y-3 lg:space-y-4">
            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 px-3 py-3 text-center transition-colors">
                <div className="text-lg lg:text-xl font-bold text-blue-600 dark:text-blue-400">
                  {detail.conditions.snowfall24hr}&quot;
                </div>
                <div className="text-[10px] lg:text-xs text-gray-500 dark:text-slate-400">Last 24hr</div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 px-3 py-3 text-center transition-colors">
                <div className="text-lg lg:text-xl font-bold text-blue-600 dark:text-blue-400">
                  {detail.conditions.forecasts["5day"].display}
                </div>
                <div className="text-[10px] lg:text-xs text-gray-500 dark:text-slate-400">Next 5 days</div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 px-3 py-3 text-center transition-colors">
                <div className="text-lg lg:text-xl font-bold text-gray-700 dark:text-slate-300">
                  {detail.conditions.baseDepth}&quot;
                </div>
                <div className="text-[10px] lg:text-xs text-gray-500 dark:text-slate-400">Base depth</div>
              </div>
            </div>

            {/* 10-Day Forecast Chart */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors">
              <div className="px-4 md:px-5 lg:px-6 py-2.5 border-b border-gray-100 dark:border-slate-700">
                <h3 className="text-xs lg:text-sm font-bold tracking-wide text-gray-500 dark:text-slate-400">
                  10-DAY SNOW FORECAST
                </h3>
              </div>
              <div className="px-2 lg:px-3 py-3">
                <div className="flex gap-0.5 lg:gap-1">
                  {forecast.map((day) => (
                    <ForecastBar key={day.date} day={day} maxSnow={maxSnow} />
                  ))}
                </div>
              </div>
            </div>

            {/* Season context */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 px-4 md:px-5 lg:px-6 py-3 transition-colors">
              <h3 className="text-xs lg:text-sm font-bold tracking-wide text-gray-500 dark:text-slate-400 mb-2">
                SEASON CONTEXT
              </h3>
              <div className="flex gap-6 text-xs lg:text-sm">
                <div>
                  <span className="text-gray-700 dark:text-slate-300 font-medium">{detail.seasonTotal}&quot;</span>
                  <span className="text-gray-500 dark:text-slate-400 ml-1">season total</span>
                </div>
                <div>
                  <span className={`font-medium ${detail.snowpackPercent < 70 ? "text-amber-600 dark:text-amber-400" : "text-gray-700 dark:text-slate-300"}`}>
                    {detail.snowpackPercent}%
                  </span>
                  <span className="text-gray-500 dark:text-slate-400 ml-1">of normal snowpack</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-3 lg:space-y-4">
            {/* Daily breakdown */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors">
              <div className="px-4 md:px-5 lg:px-6 py-2.5 border-b border-gray-100 dark:border-slate-700">
                <h3 className="text-xs lg:text-sm font-bold tracking-wide text-gray-500 dark:text-slate-400">
                  DAILY BREAKDOWN
                </h3>
              </div>
              <div className="divide-y divide-gray-50 dark:divide-slate-700">
                {forecast.map((day) => (
                  <div key={day.date} className="px-4 md:px-5 lg:px-6 py-2.5 flex items-center gap-3">
                    <div className="w-14 shrink-0">
                      <div className="text-xs lg:text-sm font-medium text-gray-900 dark:text-white">{day.day}</div>
                      <div className="text-[10px] lg:text-xs text-gray-400 dark:text-slate-500">{day.date}</div>
                    </div>
                    <span className="text-base lg:text-lg">
                      {day.icon === "heavy-snow" && "\uD83C\uDF28\uFE0F"}
                      {day.icon === "snow" && "\u2744\uFE0F"}
                      {day.icon === "cloudy" && "\u2601\uFE0F"}
                      {day.icon === "partly-cloudy" && "\u26C5"}
                      {day.icon === "sunny" && "\u2600\uFE0F"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs lg:text-sm text-gray-700 dark:text-slate-300">{day.conditions}</div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-xs lg:text-sm">
                      <span className={`font-bold tabular-nums ${day.snowfall > 0 ? "text-blue-600 dark:text-blue-400" : "text-gray-300 dark:text-slate-600"}`}>
                        {day.snowfall > 0 ? `${day.snowfall}"` : "\u2014"}
                      </span>
                      <span className="text-gray-500 dark:text-slate-400 tabular-nums">
                        {day.tempHigh}&deg;/{day.tempLow}&deg;
                      </span>
                      <span className="text-gray-400 dark:text-slate-500 tabular-nums">{day.wind}mph</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Analysis */}
            {detail.aiAnalysis && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 px-4 md:px-5 lg:px-6 py-3 lg:py-4 transition-colors">
                <h3 className="text-xs lg:text-sm font-bold tracking-wide text-gray-500 dark:text-slate-400 mb-2">
                  AI ANALYSIS
                </h3>
                <p className="text-xs lg:text-sm text-gray-700 dark:text-slate-300 leading-relaxed">
                  {detail.aiAnalysis}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Webcam */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors">
          <div className="px-4 md:px-5 lg:px-6 py-2.5 border-b border-gray-100 dark:border-slate-700">
            <h3 className="text-xs lg:text-sm font-bold tracking-wide text-gray-500 dark:text-slate-400">WEBCAM</h3>
          </div>
          <div className="aspect-video bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
            <div className="text-center">
              <span className="text-3xl">{"\uD83D\uDCF7"}</span>
              <p className="text-xs lg:text-sm text-gray-400 dark:text-slate-500 mt-1">Live webcam feed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 md:px-6 lg:px-8 py-6 text-center">
        <p className="text-[10px] lg:text-xs text-blue-200 dark:text-slate-500">POC &mdash; Resort Detail View</p>
      </div>
    </div>
  );
}
