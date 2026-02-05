"use client";

import { TimeWindow } from "@/data/types";

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
    <div className="inline-flex bg-gray-100 rounded-lg p-0.5">
      {windows.map((w) => (
        <button
          key={w.value}
          onClick={() => onChange(w.value)}
          className={`text-xs lg:text-sm font-medium py-1.5 lg:py-2 px-4 lg:px-6 rounded-md transition-all ${
            active === w.value
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {w.label}
        </button>
      ))}
    </div>
  );
}
