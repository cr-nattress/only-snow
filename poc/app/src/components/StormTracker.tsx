"use client";

import Link from "next/link";
import { StormTrackerState } from "@/data/types";

interface StormTrackerProps {
  storm: StormTrackerState;
}

const severityStyles = {
  quiet: {
    bg: "bg-gray-50",
    border: "border-gray-200",
    text: "text-gray-500",
    icon: "",
    label: "STORMS",
  },
  moderate: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-800",
    icon: "🟡",
    label: "STORMS",
  },
  significant: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-800",
    icon: "🟠",
    label: "STORMS",
  },
  chase: {
    bg: "bg-red-50",
    border: "border-red-300",
    text: "text-red-800",
    icon: "🔴",
    label: "STORMS",
  },
};

export default function StormTracker({ storm }: StormTrackerProps) {
  const style = severityStyles[storm.severity];
  const isActive = storm.severity !== "quiet";

  const content = (
    <div
      className={`rounded-xl shadow-sm border ${style.border} ${style.bg} px-4 md:px-5 lg:px-6 py-3 lg:py-4 ${
        isActive ? "cursor-pointer hover:shadow-md transition-shadow" : ""
      }`}
    >
      <div className="flex items-start gap-2">
        {/* Icon + label */}
        <div className="flex items-center gap-1.5 shrink-0">
          {style.icon && <span className="text-sm">{style.icon}</span>}
          <span className={`text-xs lg:text-sm font-bold tracking-wide ${style.text}`}>
            {style.label}
          </span>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className={`text-xs lg:text-sm ${style.text} leading-relaxed`}>{storm.text}</p>

          {/* Flight price badge */}
          {storm.flightPrice && (
            <div className="mt-1.5 flex items-center gap-2">
              <span className="text-xs font-medium text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                ✈️ {storm.flightPrice} RT
              </span>
            </div>
          )}
        </div>

        {/* CTA arrow */}
        {storm.cta && (
          <div className="shrink-0 flex items-center">
            <span className={`text-xs ${style.text}`}>→</span>
          </div>
        )}
      </div>

      {/* CTA text */}
      {storm.cta && (
        <p className={`text-[10px] ${style.text} mt-1 ml-6 opacity-75`}>
          {storm.cta}
        </p>
      )}
    </div>
  );

  if (isActive) {
    return <Link href="/chase">{content}</Link>;
  }

  return content;
}
