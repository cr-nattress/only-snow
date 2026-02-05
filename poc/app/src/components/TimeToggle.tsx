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
    <div className="flex bg-gray-100 rounded-lg p-0.5">
      {windows.map((w) => (
        <button
          key={w.value}
          onClick={() => onChange(w.value)}
          className={`flex-1 text-xs font-medium py-1.5 px-2 rounded-md transition-all ${
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
