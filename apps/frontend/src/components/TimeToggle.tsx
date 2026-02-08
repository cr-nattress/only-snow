"use client";

import { TimeWindow } from "@/data/types";
import { log } from "@/lib/log";

interface TimeToggleProps {
  active: TimeWindow;
  onChange: (window: TimeWindow) => void;
}

const windows: { value: TimeWindow; label: string }[] = [
  { value: "5day", label: "5 Day" },
  { value: "10day", label: "10 Day" },
];

export default function TimeToggle({ active, onChange }: TimeToggleProps) {
  return (
    <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 transition-colors">
      {windows.map((w) => (
        <button
          key={w.value}
          onClick={() => { log("dashboard.time_toggle", { window: w.value }); onChange(w.value); }}
          className={`text-xs lg:text-sm font-medium py-1.5 lg:py-2 px-4 lg:px-6 rounded-md transition-all btn-press ${
            active === w.value
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          {w.label}
        </button>
      ))}
    </div>
  );
}
