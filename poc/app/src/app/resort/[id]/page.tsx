"use client";

import { use } from "react";
import Link from "next/link";
import { vailDetail, vailForecast } from "@/data/scenarios";
import { resorts } from "@/data/resorts";
import { DailyForecast } from "@/data/types";

function ForecastBar({ day, maxSnow }: { day: DailyForecast; maxSnow: number }) {
  const height = maxSnow > 0 ? Math.max((day.snowfall / maxSnow) * 64, day.snowfall > 0 ? 8 : 0) : 0;
  const hasSnow = day.snowfall > 0;

  return (
    <div className="flex flex-col items-center gap-1 flex-1">
      <span className={`text-[10px] lg:text-xs font-bold tabular-nums ${hasSnow ? "text-blue-600" : "text-gray-300"}`}>
        {day.snowfall > 0 ? `${day.snowfall}"` : "—"}
      </span>
      <div className="w-full flex items-end justify-center h-16 lg:h-20">
        <div
          className={`w-5 lg:w-7 rounded-t transition-all ${hasSnow ? "bg-blue-500" : "bg-gray-100"}`}
          style={{ height: `${height}px` }}
        />
      </div>
      <span className="text-sm lg:text-base">
        {day.icon === "heavy-snow" && "🌨️"}
        {day.icon === "snow" && "❄️"}
        {day.icon === "cloudy" && "☁️"}
        {day.icon === "partly-cloudy" && "⛅"}
        {day.icon === "sunny" && "☀️"}
      </span>
      <div className="text-center">
        <div className="text-[10px] lg:text-xs text-gray-700 font-medium">{day.tempHigh}°</div>
        <div className="text-[10px] lg:text-xs text-gray-400">{day.tempLow}°</div>
      </div>
      <div className="text-[10px] lg:text-xs font-medium text-gray-500">{day.day}</div>
    </div>
  );
}

export default function ResortDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const resort = Object.values(resorts).find((r) => r.id === id);
  const detail = vailDetail;
  const forecast = vailForecast;
  const maxSnow = Math.max(...forecast.map((d) => d.snowfall));

  if (!resort) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Resort not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">
            ←
          </Link>
          <div>
            <h1 className="text-lg lg:text-xl font-bold text-gray-900">{resort.name}</h1>
            <p className="text-xs lg:text-sm text-gray-500">
              {resort.region} · {resort.driveTime} · Next 10 Days
            </p>
          </div>
          <span className="ml-auto text-[10px] lg:text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">
            {resort.passType.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Context banner */}
      {detail.contextBanner && (
        <div className="bg-blue-50 border-b border-blue-100 px-4 md:px-6 lg:px-8 py-2">
          <p className="text-xs lg:text-sm text-blue-800 font-medium">{detail.contextBanner}</p>
        </div>
      )}

      <div className="px-4 md:px-6 lg:px-8 py-3 lg:py-4 space-y-3 lg:space-y-4">
        {/* Resort status bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 md:px-5 lg:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 lg:gap-6 text-xs lg:text-sm">
              <div>
                <span className="font-bold text-gray-900">{detail.conditions.openPercent}%</span>
                <span className="text-gray-500 ml-1">open</span>
              </div>
              <div>
                <span className="text-gray-700">
                  {detail.conditions.trailsOpen}/{detail.conditions.trailsTotal}
                </span>
                <span className="text-gray-500 ml-1">trails</span>
              </div>
              <div>
                <span className="text-gray-700">
                  {detail.conditions.liftsOpen}/{detail.conditions.liftsTotal}
                </span>
                <span className="text-gray-500 ml-1">lifts</span>
              </div>
            </div>
            <span className="text-xs lg:text-sm font-medium text-gray-500">
              {detail.conditions.conditions}
            </span>
          </div>
        </div>

        {/* Two-column layout on desktop: left = stats + chart, right = breakdown + analysis */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-4 space-y-3 lg:space-y-0">
          {/* Left column */}
          <div className="space-y-3 lg:space-y-4">
            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-3 py-3 text-center">
                <div className="text-lg lg:text-xl font-bold text-blue-600">
                  {detail.conditions.snowfall24hr}&quot;
                </div>
                <div className="text-[10px] lg:text-xs text-gray-500">Last 24hr</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-3 py-3 text-center">
                <div className="text-lg lg:text-xl font-bold text-blue-600">
                  {detail.conditions.forecasts["5day"].display}
                </div>
                <div className="text-[10px] lg:text-xs text-gray-500">Next 5 days</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-3 py-3 text-center">
                <div className="text-lg lg:text-xl font-bold text-gray-700">
                  {detail.conditions.baseDepth}&quot;
                </div>
                <div className="text-[10px] lg:text-xs text-gray-500">Base depth</div>
              </div>
            </div>

            {/* 10-Day Forecast Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 md:px-5 lg:px-6 py-2.5 border-b border-gray-100">
                <h3 className="text-xs lg:text-sm font-bold tracking-wide text-gray-500">
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 md:px-5 lg:px-6 py-3">
              <h3 className="text-xs lg:text-sm font-bold tracking-wide text-gray-500 mb-2">
                SEASON CONTEXT
              </h3>
              <div className="flex gap-6 text-xs lg:text-sm">
                <div>
                  <span className="text-gray-700 font-medium">{detail.seasonTotal}&quot;</span>
                  <span className="text-gray-500 ml-1">season total</span>
                </div>
                <div>
                  <span className={`font-medium ${detail.snowpackPercent < 70 ? "text-amber-600" : "text-gray-700"}`}>
                    {detail.snowpackPercent}%
                  </span>
                  <span className="text-gray-500 ml-1">of normal snowpack</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-3 lg:space-y-4">
            {/* Daily breakdown */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 md:px-5 lg:px-6 py-2.5 border-b border-gray-100">
                <h3 className="text-xs lg:text-sm font-bold tracking-wide text-gray-500">
                  DAILY BREAKDOWN
                </h3>
              </div>
              <div className="divide-y divide-gray-50">
                {forecast.map((day) => (
                  <div key={day.date} className="px-4 md:px-5 lg:px-6 py-2.5 flex items-center gap-3">
                    <div className="w-14 shrink-0">
                      <div className="text-xs lg:text-sm font-medium text-gray-900">{day.day}</div>
                      <div className="text-[10px] lg:text-xs text-gray-400">{day.date}</div>
                    </div>
                    <span className="text-base lg:text-lg">
                      {day.icon === "heavy-snow" && "🌨️"}
                      {day.icon === "snow" && "❄️"}
                      {day.icon === "cloudy" && "☁️"}
                      {day.icon === "partly-cloudy" && "⛅"}
                      {day.icon === "sunny" && "☀️"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs lg:text-sm text-gray-700">{day.conditions}</div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-xs lg:text-sm">
                      <span className={`font-bold tabular-nums ${day.snowfall > 0 ? "text-blue-600" : "text-gray-300"}`}>
                        {day.snowfall > 0 ? `${day.snowfall}"` : "—"}
                      </span>
                      <span className="text-gray-500 tabular-nums">
                        {day.tempHigh}°/{day.tempLow}°
                      </span>
                      <span className="text-gray-400 tabular-nums">{day.wind}mph</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Analysis */}
            {detail.aiAnalysis && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 md:px-5 lg:px-6 py-3 lg:py-4">
                <h3 className="text-xs lg:text-sm font-bold tracking-wide text-gray-500 mb-2">
                  AI ANALYSIS
                </h3>
                <p className="text-xs lg:text-sm text-gray-700 leading-relaxed">
                  {detail.aiAnalysis}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Webcam — full width below two-column layout */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 md:px-5 lg:px-6 py-2.5 border-b border-gray-100">
            <h3 className="text-xs lg:text-sm font-bold tracking-wide text-gray-500">WEBCAM</h3>
          </div>
          <div className="aspect-video bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <span className="text-3xl">📷</span>
              <p className="text-xs lg:text-sm text-gray-400 mt-1">Live webcam feed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 md:px-6 lg:px-8 py-6 text-center">
        <p className="text-[10px] lg:text-xs text-gray-400">POC — Resort Detail View</p>
      </div>
    </div>
  );
}
