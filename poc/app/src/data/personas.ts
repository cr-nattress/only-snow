import { Persona, PersonaInfo, PersonaType } from "./types";

// Legacy 5-persona system (kept for backward compatibility)
export const personas: PersonaInfo[] = [
  {
    id: "powder-hunter",
    label: "Powder Hunter",
    icon: "snowflake",
    description: "Chasing fresh snow is my life",
    focus: "Snowfall totals, storm timing, terrain status",
  },
  {
    id: "family-planner",
    label: "Family Planner",
    icon: "users",
    description: "Making ski days work for everyone",
    focus: "Grooming, crowds, beginner terrain, amenities",
  },
  {
    id: "weekend-warrior",
    label: "Weekend Warrior",
    icon: "calendar",
    description: "Maximizing limited ski time",
    focus: "Drive time, value, conditions per hour invested",
  },
  {
    id: "destination-traveler",
    label: "Destination Traveler",
    icon: "plane",
    description: "Planning epic ski trips",
    focus: "National storms, flight prices, extended forecasts",
  },
  {
    id: "beginner",
    label: "Beginner",
    icon: "star",
    description: "Learning and loving it",
    focus: "Beginner-friendly resorts, ideal weather conditions",
  },
];

export function getPersonaInfo(id: Persona): PersonaInfo {
  return personas.find((p) => p.id === id) || personas[0];
}

export function getPersonaIcon(id: Persona): string {
  const iconMap: Record<Persona, string> = {
    "powder-hunter": "snowflake",
    "family-planner": "users",
    "weekend-warrior": "clock",
    "destination-traveler": "plane",
    beginner: "star",
  };
  return iconMap[id];
}

// New 9-persona system
export interface PersonaInfoV2 {
  id: PersonaType;
  label: string;
  emoji: string;
  description: string;
  focus: string;
  notificationStyle: string;
  dataEmphasis: string[];
}

export const personasV2: PersonaInfoV2[] = [
  {
    id: "core-local",
    label: "Core Local",
    emoji: "🎿",
    description: "You live for skiing — 20+ days a season, chasing every storm",
    focus: "Daily snow updates, real-time conditions, dawn patrol alerts",
    notificationStyle: "High frequency, early morning alerts",
    dataEmphasis: ["snowfall", "terrain-status", "lift-lines", "wind"],
  },
  {
    id: "storm-chaser",
    label: "Storm Chaser",
    emoji: "🌨️",
    description: "You'll travel anywhere when a big storm hits",
    focus: "National storm tracking, flight deals, destination conditions",
    notificationStyle: "Storm alerts with travel options",
    dataEmphasis: ["storm-forecasts", "flight-prices", "multi-day-totals"],
  },
  {
    id: "family-planner",
    label: "Family Planner",
    emoji: "👨‍👩‍👧",
    description: "Making ski days work for the whole family",
    focus: "Grooming, crowds, lessons, kid-friendly terrain, amenities",
    notificationStyle: "Weekend-focused, family-friendly alerts",
    dataEmphasis: ["grooming", "crowds", "beginner-terrain", "weather"],
  },
  {
    id: "weekend-warrior",
    label: "Weekend Warrior",
    emoji: "⏰",
    description: "Maximizing every weekend opportunity",
    focus: "Weekend conditions, drive time optimization, best value",
    notificationStyle: "Thursday outlook, early Saturday alerts",
    dataEmphasis: ["weekend-forecast", "drive-time", "value"],
  },
  {
    id: "resort-loyalist",
    label: "Resort Loyalist",
    emoji: "🏔️",
    description: "You have your mountain — you just need to know when",
    focus: "Single-resort deep-dive, optimal timing, seasonal patterns",
    notificationStyle: "Resort-specific alerts",
    dataEmphasis: ["single-resort", "historical-comparison", "lift-status"],
  },
  {
    id: "learning-curve",
    label: "Learning Curve",
    emoji: "⭐",
    description: "Building skills and confidence on the slopes",
    focus: "Ideal learning conditions, beginner-friendly resorts, weather",
    notificationStyle: "Gentle alerts for ideal conditions",
    dataEmphasis: ["grooming", "visibility", "temperature", "beginner-terrain"],
  },
  {
    id: "social-skier",
    label: "Social Skier",
    emoji: "🍻",
    description: "Skiing is about the experience and the people",
    focus: "Lodge scene, events, group coordination, apres-ski",
    notificationStyle: "Event-based, social group coordination",
    dataEmphasis: ["events", "base-lodge", "apres-scene"],
  },
  {
    id: "luxury-seeker",
    label: "Luxury Seeker",
    emoji: "✨",
    description: "Quality over quantity — seeking premium experiences",
    focus: "Premium resorts, VIP access, upscale lodging, best snow",
    notificationStyle: "Curated premium alerts",
    dataEmphasis: ["premium-resorts", "conditions", "dining", "lodging"],
  },
  {
    id: "budget-maximizer",
    label: "Budget Maximizer",
    emoji: "💰",
    description: "Getting the most skiing for every dollar spent",
    focus: "Deals, pass value, discounted days, multi-mountain passes",
    notificationStyle: "Deal alerts, value-focused recommendations",
    dataEmphasis: ["deals", "pass-value", "free-days", "discounts"],
  },
];

export function getPersonaInfoV2(id: PersonaType): PersonaInfoV2 {
  return personasV2.find((p) => p.id === id) || personasV2[0];
}

export function getPersonaEmojiV2(id: PersonaType): string {
  const persona = personasV2.find((p) => p.id === id);
  return persona?.emoji || "🎿";
}

// Map legacy 5 personas to new 9 personas
export function legacyToNewPersona(legacy: Persona): PersonaType {
  const mapping: Record<Persona, PersonaType> = {
    "powder-hunter": "core-local",
    "family-planner": "family-planner",
    "weekend-warrior": "weekend-warrior",
    "destination-traveler": "storm-chaser",
    beginner: "learning-curve",
  };
  return mapping[legacy];
}

// Map new 9 personas to legacy 5 personas (for backward compatibility)
export function newToLegacyPersona(newPersona: PersonaType): Persona {
  const mapping: Record<PersonaType, Persona> = {
    "core-local": "powder-hunter",
    "storm-chaser": "destination-traveler",
    "family-planner": "family-planner",
    "weekend-warrior": "weekend-warrior",
    "resort-loyalist": "powder-hunter",
    "learning-curve": "beginner",
    "social-skier": "weekend-warrior",
    "luxury-seeker": "destination-traveler",
    "budget-maximizer": "weekend-warrior",
  };
  return mapping[newPersona];
}
