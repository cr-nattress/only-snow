"use client";

import { Recommendation as RecommendationType, Persona, PersonaType } from "@/data/types";
import { usePersona } from "@/context/PersonaContext";

interface RecommendationProps {
  recommendation: RecommendationType;
}

// Legacy persona headline (for backward compat)
function getPersonaHeadlineLegacy(persona: Persona): { icon: string; text: string } {
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

// New 9-persona headline
function getPersonaTypeHeadline(persona: PersonaType): { icon: string; text: string } {
  switch (persona) {
    case "core-local":
      return { icon: "🎿", text: "POWDER REPORT" };
    case "storm-chaser":
      return { icon: "🌨️", text: "STORM INTEL" };
    case "family-planner":
      return { icon: "👨‍👩‍👧", text: "FAMILY PICK" };
    case "weekend-warrior":
      return { icon: "⏰", text: "QUICK DECISION" };
    case "resort-loyalist":
      return { icon: "🏔️", text: "YOUR MOUNTAIN" };
    case "learning-curve":
      return { icon: "⭐", text: "BEST FOR LEARNING" };
    case "social-skier":
      return { icon: "🍻", text: "CREW PICK" };
    case "luxury-seeker":
      return { icon: "✨", text: "PREMIUM PICK" };
    case "budget-maximizer":
      return { icon: "💰", text: "BEST VALUE" };
    default:
      return { icon: "💡", text: "RECOMMENDATION" };
  }
}

// Legacy on-pass label
function getPersonaOnPassLabelLegacy(persona: Persona): string {
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

// New 9-persona on-pass label
function getPersonaTypeOnPassLabel(persona: PersonaType): string {
  switch (persona) {
    case "core-local":
      return "FRESHEST ON PASS";
    case "storm-chaser":
      return "CHASE WORTHY";
    case "family-planner":
      return "FAMILY-FRIENDLY";
    case "weekend-warrior":
      return "BEST ROI";
    case "resort-loyalist":
      return "YOUR HOME";
    case "learning-curve":
      return "BEGINNER-FRIENDLY";
    case "social-skier":
      return "BEST SCENE";
    case "luxury-seeker":
      return "PREMIUM PICK";
    case "budget-maximizer":
      return "BEST DEAL";
    default:
      return "ON YOUR PASS";
  }
}

// Legacy best snow label
function getPersonaBestSnowLabelLegacy(persona: Persona): string {
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

// New 9-persona best snow label
function getPersonaTypeBestSnowLabel(persona: PersonaType): string {
  switch (persona) {
    case "core-local":
      return "DEEPEST SNOW";
    case "storm-chaser":
      return "STORM TARGET";
    case "family-planner":
      return "BEST CONDITIONS";
    case "weekend-warrior":
      return "WORTH THE DRIVE";
    case "resort-loyalist":
      return "UPCOMING SNOW";
    case "learning-curve":
      return "IDEAL CONDITIONS";
    case "social-skier":
      return "BEST VIBE";
    case "luxury-seeker":
      return "TOP TIER";
    case "budget-maximizer":
      return "VALUE PICK";
    default:
      return "BEST SNOW";
  }
}

export default function Recommendation({ recommendation }: RecommendationProps) {
  const { persona, userPersona, effectivePersonaType } = usePersona();

  // Use new persona system if available, otherwise fall back to legacy
  const headline = userPersona
    ? getPersonaTypeHeadline(effectivePersonaType)
    : getPersonaHeadlineLegacy(persona);
  const onPassLabel = userPersona
    ? getPersonaTypeOnPassLabel(effectivePersonaType)
    : getPersonaOnPassLabelLegacy(persona);
  const bestSnowLabel = userPersona
    ? getPersonaTypeBestSnowLabel(effectivePersonaType)
    : getPersonaBestSnowLabelLegacy(persona);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden animate-fade-slide-in transition-colors">
      <div className="px-4 md:px-5 lg:px-6 py-3 lg:py-4">
        <h3 className="text-xs lg:text-sm font-bold tracking-wide text-gray-500 dark:text-gray-400 mb-2.5 lg:mb-3">
          {headline.icon} {headline.text}
        </h3>
        <div className="space-y-2.5 lg:space-y-3">
          {/* On pass */}
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] font-bold text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/50 px-1.5 py-0.5 rounded transition-colors">
                {onPassLabel}
              </span>
            </div>
            <p className="text-xs lg:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {recommendation.onPass}
            </p>
          </div>

          {/* Best snow */}
          {recommendation.bestSnow && (
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50 px-1.5 py-0.5 rounded transition-colors">
                  {bestSnowLabel}
                </span>
              </div>
              <p className="text-xs lg:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {recommendation.bestSnow}
              </p>
            </div>
          )}

          {/* Best value */}
          {recommendation.bestValue && (
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/50 px-1.5 py-0.5 rounded transition-colors">
                  BEST VALUE
                </span>
              </div>
              <p className="text-xs lg:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {recommendation.bestValue}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
