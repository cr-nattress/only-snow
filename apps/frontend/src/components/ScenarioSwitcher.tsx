"use client";

import { useState, useRef } from "react";
import { Scenario } from "@/data/types";

interface PromptInputProps {
  scenarios: Scenario[];
  activeId: string;
  onChange: (id: string) => void;
}

function matchScenario(input: string, scenarios: Scenario[]): string | null {
  const lower = input.toLowerCase();
  if (lower.includes("avon") || lower.includes("powder day")) return "avon-powder";
  if (lower.includes("storm") || (lower.includes("denver") && lower.includes("storm"))) return "denver-storm";
  if (lower.includes("scranton") || lower.includes("pa") || lower.includes("pocono") || lower.includes("chase")) return "pa-chase";
  if (lower.includes("denver") || lower.includes("epic")) return "denver-dry";
  for (const s of scenarios) {
    if (lower.includes(s.location.toLowerCase().split(",")[0])) return s.id;
  }
  return null;
}

export default function PromptInput({ scenarios, activeId, onChange }: PromptInputProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (!query.trim()) return;
    const match = matchScenario(query, scenarios);
    if (match) {
      onChange(match);
      setQuery("");
    }
  };

  return (
    <div className="px-4 md:px-6 lg:px-8 pt-3 pb-3">
      <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 lg:px-4 py-2.5 lg:py-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-colors">
        <span className="text-sm lg:text-base text-gray-400 dark:text-gray-500 shrink-0">&#x1F50D;</span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Where do you live and what pass do you have?"
          className="flex-1 bg-transparent text-sm lg:text-base font-medium text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 outline-none"
        />
        {query && (
          <button
            onClick={handleSubmit}
            className="shrink-0 bg-blue-600 dark:bg-blue-500 text-white text-xs lg:text-sm font-bold px-3 lg:px-4 py-1.5 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 active:bg-blue-800 dark:active:bg-blue-700 transition-colors btn-press"
          >
            Go
          </button>
        )}
      </div>
    </div>
  );
}
