import { Persona, PersonaInfo } from "./types";

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
