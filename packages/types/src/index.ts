// API Response Types

export interface Freshness {
  dataAgeMinutes: number;
  source: string;
  updatedAt: string; // ISO 8601
}

export interface ResortSummary {
  id: number;
  name: string;
  slug: string;
  lat: number;
  lng: number;
  elevationSummit: number;
  elevationBase: number;
  region: string;
  passType: string | null;
  conditions: {
    snowfall24h: number | null;
    snowfall48h: number | null;
    baseDepth: number | null;
    liftsOpen: number | null;
    trailsOpen: number | null;
    surfaceCondition: string | null;
    resortStatus: string | null;
  } | null;
  freshness: Freshness;
}

export interface ResortDetail extends ResortSummary {
  aspect: string | null;
  terrainProfile: TerrainProfile | null;
  totalLifts: number | null;
  totalTrails: number | null;
  terrainAcres: number | null;
  website: string | null;
  nearestAirport: string | null;
  forecast: DailyForecast[];
  snowpack: SnowpackReading | null;
  avalanche: AvalancheInfo | null;
}

export interface TerrainProfile {
  beginner: number;
  intermediate: number;
  advanced: number;
  expert?: number;
}

export interface DailyForecast {
  date: string;
  snowfall: number | null;
  tempHigh: number | null;
  tempLow: number | null;
  windSpeed: number | null;
  cloudCover: number | null;
  conditions: string | null;
  confidence: 'high' | 'medium' | 'low';
  narrative: string | null;
}

export interface HourlyForecast {
  datetime: string;
  temperature: number | null;
  snowfall: number | null;
  precipitation: number | null;
  windSpeed: number | null;
  windDirection: number | null;
  cloudCover: number | null;
  freezingLevel: number | null;
}

export interface ForecastResponse {
  resortId: number;
  daily: DailyForecast[];
  hourly: HourlyForecast[];
  freshness: Freshness;
}

export interface SnowpackReading {
  stationName: string;
  swe: number | null;
  sweMedianPct: number | null;
  snowDepth: number | null;
  date: string;
}

export interface AvalancheInfo {
  zoneName: string;
  dangerRating: 'low' | 'moderate' | 'considerable' | 'high' | 'extreme';
  forecastUrl: string | null;
  updatedAt: string;
}

export interface RegionSummary {
  id: number;
  name: string;
  lat: number;
  lng: number;
  bestAirport: string | null;
  resortCount: number;
  totalSnowfall5Day: number;
  bestResort: {
    name: string;
    slug: string;
    snowfall5Day: number;
  } | null;
  stormSeverity: 'none' | 'light' | 'moderate' | 'heavy' | 'epic';
}

export interface RegionComparison {
  regionId: number;
  regionName: string;
  resorts: ResortComparisonRow[];
  freshness: Freshness;
}

export interface ResortComparisonRow {
  id: number;
  name: string;
  slug: string;
  passType: string | null;
  elevationSummit: number;
  snowfall24h: number | null;
  snowfall48h: number | null;
  snowfall5Day: number | null;
  baseDepth: number | null;
  liftsOpen: number | null;
  totalLifts: number | null;
  conditions: string | null;
}

export interface SnowRanking {
  rank: number;
  resort: ResortSummary;
  snowfall: number;
  timeframe: '24h' | '48h' | '72h' | '7d';
}

export interface ChaseAlert {
  regionId: number;
  regionName: string;
  bestAirport: string | null;
  expectedSnowfall: number; // inches over next 5-7 days
  bestResort: string;
  bestResortSlug: string;
  peakDays: string[]; // ISO dates of heaviest snow
  confidence: 'high' | 'medium' | 'low';
}

export interface TripEstimate {
  regionId: number;
  regionName: string;
  resortName: string;
  flightEstimate: { lowCents: number; highCents: number } | null;
  lodgingEstimate: { lowCents: number; highCents: number } | null;
  liftTicketCents: number | null;
  totalEstimate: { lowCents: number; highCents: number };
  affiliateLinks: {
    flights: string | null;
    lodging: string | null;
  };
}

export interface DriveTime {
  resortId: number;
  resortName: string;
  durationMinutes: number;
  distanceMiles: number;
}

export interface UserPreferences {
  passType: string | null;
  location: string | null;
  driveRadius: number | null;
  chaseWillingness: string | null;
  persona: string | null;
  preferences: Record<string, unknown> | null;
}

// Pass types
export type PassType = 'epic' | 'ikon' | 'indy' | 'independent';

// Legacy 5-persona system (renamed to avoid collision with new 9-persona system)
export type PersonaLegacy =
  | 'powder-hunter'
  | 'family-planner'
  | 'beginner'
  | 'weekend-warrior'
  | 'destination-traveler';

// New 9-persona system
export type PersonaType =
  | 'core-local'
  | 'storm-chaser'
  | 'family-planner'
  | 'weekend-warrior'
  | 'resort-loyalist'
  | 'learning-curve'
  | 'social-skier'
  | 'luxury-seeker'
  | 'budget-maximizer';

// Signal types collected during onboarding
export type SkiFrequency = 'casual' | 'regular' | 'core';
export type GroupType = 'solo' | 'partner' | 'family' | 'friends';
export type DecisionTrigger = 'snow' | 'time' | 'deal' | 'planned';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface OnboardingSignals {
  frequency: SkiFrequency;
  groupType: GroupType;
  decisionTriggers: DecisionTrigger[];
  experienceLevel: ExperienceLevel;
  childAges?: number[];
}

export interface UserPersona {
  primary: PersonaType;
  secondary?: PersonaType;
  confidence: number;
  signals: OnboardingSignals;
}

// Unified storm severity — superset of backend and frontend values
export type StormSeverity =
  | 'none'
  | 'quiet'
  | 'light'
  | 'moderate'
  | 'significant'
  | 'heavy'
  | 'epic'
  | 'chase';

export interface PersonaHighlight {
  label: string;
  value: string;
  icon: string;
}

// API Query Parameters
export interface ResortsQueryParams {
  region?: string;
  passType?: string;
  lat?: number;
  lng?: number;
  radiusMiles?: number;
  persona?: PersonaLegacy;
}

export interface RankingsQueryParams {
  timeframe?: '24h' | '48h' | '72h' | '7d';
  region?: string;
  passType?: string;
  limit?: number;
}
