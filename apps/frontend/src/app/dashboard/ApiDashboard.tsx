"use client";

import dynamic from "next/dynamic";
import type { DashboardData } from "@/lib/data-provider";
import ResortTable from "@/components/ResortTable";
import AiAnalysis from "@/components/ExpertTake";

const ResortMap = dynamic(() => import("@/components/ResortMap"), { ssr: false });

interface ApiDashboardProps {
  data: DashboardData;
}

export default function ApiDashboard({ data }: ApiDashboardProps) {
  return (
    <div className="min-h-screen">
      {/* Resort Map */}
      <ResortMap resorts={data.mapResorts} />

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

        {/* Resort table with storm tracker */}
        <ResortTable
          resorts={data.resorts}
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
