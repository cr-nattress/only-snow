import type {
  PassType,
  PersonaLegacy,
  PersonaType,
  StormSeverity,
  SkiFrequency,
  GroupType,
  DecisionTrigger,
  ExperienceLevel,
  OnboardingSignals,
  UserPersona,
} from '@onlysnow/types';

// Re-export shared types
export type { PassType, PersonaType, StormSeverity, SkiFrequency, GroupType, DecisionTrigger, ExperienceLevel, OnboardingSignals, UserPersona };

// Re-export PersonaLegacy as Persona for backward compat
export type Persona = PersonaLegacy;

// Frontend-only types below

export interface PersonaInfo {
  id: Persona;
  label: string;
  icon: string;
  description: string;
  focus: string;
}

export interface Resort {
  id: string;
  name: string;
  passType: PassType;
  driveTime: string;
  driveMinutes: number;
  elevation: number;
  region: string;
  lat: number;
  lng: number;
}

export type TimeWindow = "5day" | "10day";

/** Per-time-window forecast values for a single resort */
export interface ResortForecasts {
  "5day": { display: string; sort: number; daily?: number[] };
  "10day": { display: string; sort: number; daily?: number[] };
}

export interface ResortConditions {
  resort: Resort;
  snowfall24hr: number;
  baseDepth: number;
  openPercent: number;
  trailsOpen: number;
  trailsTotal: number;
  liftsOpen: number;
  liftsTotal: number;
  conditions: string;
  forecasts: ResortForecasts;
}

export interface WorthKnowingEntry {
  resort: Resort;
  snowfall24hr: number;
  baseDepth: number;
  openPercent: number;
  walkUpPrice: number;
  reason: string;
  forecasts: ResortForecasts;
}

export interface StormTrackerState {
  severity: StormSeverity;
  text: string;
  region?: string;
  forecastTotal?: string;
  dates?: string;
  flightPrice?: string;
  cta?: string;
}

export interface Recommendation {
  onPass: string;
  bestSnow?: string;
  bestValue?: string;
}

/** AI-generated analysis text for a scenario */
export type AiAnalysis = string;

/** Per-time-window overrides for a scenario */
export interface TimeWindowOverrides {
  recommendation: Recommendation;
  contextBanner?: string;
  dateLabel: string;
  dailyLabels?: string[];
  worthKnowing?: WorthKnowingEntry[];
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  location: string;
  pass: PassType;
  passLabel: string;
  date: string;
  yourResorts: ResortConditions[];
  worthKnowing: WorthKnowingEntry[];
  stormTracker: StormTrackerState;
  recommendation: Recommendation;
  aiAnalysis?: AiAnalysis;
  contextBanner?: string;
  /** Per-window overrides — 5day is the default view, 10day is expanded */
  timeWindows: Record<TimeWindow, TimeWindowOverrides>;
}

export interface OnboardingState {
  location: string;
  pass: PassType | "multi" | "none";
  driveRadius: number;
  chaseWillingness: "anywhere" | "driving" | "no";
  persona: Persona;
}

export interface DailyForecast {
  day: string;
  date: string;
  snowfall: number;
  tempHigh: number;
  tempLow: number;
  wind: number;
  icon: "snow" | "partly-cloudy" | "sunny" | "cloudy" | "heavy-snow";
  conditions: string;
}

export interface ResortDetail {
  resort: Resort;
  conditions: ResortConditions;
  forecast: DailyForecast[];
  aiAnalysis?: AiAnalysis;
  contextBanner?: string;
  seasonTotal: number;
  snowpackPercent: number;
}

export type ChaseTier = 'withinReach' | 'worthTheTrip';

export interface ChaseRegion {
  id: string;
  name: string;
  severity: StormSeverity;
  forecastTotal: string;
  dates: string;
  resorts: string[];
  description: string;
  bestAirport?: string;
  lat: number;
  lng: number;
  driveMinutes?: number | null;
  driveDisplay?: string;
  chaseScore?: number;
  passTypes: string[];
  hasUserPass: boolean;
  snowfallNumeric: number;
}

export interface TripPlan {
  destination: string;
  dates: string;
  nights: number;
  flights: { route: string; price: number; details: string }[];
  lodging: { name: string; price: number; note: string }[];
  rentalCar: { price: number; note: string };
  liftTickets: { onPass: boolean; dailyPrice: number };
  skiPlan: { day: string; plan: string }[];
  totalEstimate: number;
  totalWithPass: number;
  costPerPowderDay: number;
}
