"use client";

import { Recommendation as RecommendationType, Persona } from "@/data/types";
import { usePersona } from "@/context/PersonaContext";

interface RecommendationProps {
  recommendation: RecommendationType;
}

function getPersonaHeadline(persona: Persona): { icon: string; text: string } {
  switch (persona) {
    case "powder-hunter":
      return { icon: "❄️", text: "POWDER REPORT" };
    case "family-planner":
      return { icon: "👨‍👩‍👧", text: "FAMILY PICK" };
    case "weekend-warrior":
      return { icon: "⏰", text: "QUICK DECISION" };
    case "destination-traveler":
      return { icon: "✈️", text: "TRIP INTEL" };
    case "beginner":
      return { icon: "⭐", text: "BEST FOR LEARNING" };
    default:
      return { icon: "💡", text: "RECOMMENDATION" };
  }
}

function getPersonaOnPassLabel(persona: Persona): string {
  switch (persona) {
    case "powder-hunter":
      return "FRESHEST ON PASS";
    case "family-planner":
      return "FAMILY-FRIENDLY";
    case "weekend-warrior":
      return "BEST ROI";
    case "destination-traveler":
      return "ON YOUR PASS";
    case "beginner":
      return "BEGINNER-FRIENDLY";
    default:
      return "ON YOUR PASS";
  }
}

function getPersonaBestSnowLabel(persona: Persona): string {
  switch (persona) {
    case "powder-hunter":
      return "DEEPEST SNOW";
    case "family-planner":
      return "BEST CONDITIONS";
    case "weekend-warrior":
      return "WORTH THE DRIVE";
    case "destination-traveler":
      return "STORM CHASING";
    case "beginner":
      return "IDEAL CONDITIONS";
    default:
      return "BEST SNOW";
  }
}

export default function Recommendation({ recommendation }: RecommendationProps) {
  const { persona } = usePersona();
  const headline = getPersonaHeadline(persona);
  const onPassLabel = getPersonaOnPassLabel(persona);
  const bestSnowLabel = getPersonaBestSnowLabel(persona);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-4 md:px-5 lg:px-6 py-3 lg:py-4">
        <h3 className="text-xs lg:text-sm font-bold tracking-wide text-gray-500 mb-2.5 lg:mb-3">
          {headline.icon} {headline.text}
        </h3>
        <div className="space-y-2.5 lg:space-y-3">
          {/* On pass */}
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded">
                {onPassLabel}
              </span>
            </div>
            <p className="text-xs lg:text-sm text-gray-700 leading-relaxed">
              {recommendation.onPass}
            </p>
          </div>

          {/* Best snow */}
          {recommendation.bestSnow && (
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                  {bestSnowLabel}
                </span>
              </div>
              <p className="text-xs lg:text-sm text-gray-700 leading-relaxed">
                {recommendation.bestSnow}
              </p>
            </div>
          )}

          {/* Best value */}
          {recommendation.bestValue && (
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                  BEST VALUE
                </span>
              </div>
              <p className="text-xs lg:text-sm text-gray-700 leading-relaxed">
                {recommendation.bestValue}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
