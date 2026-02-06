import type { OpenMeteoResponse } from './open-meteo.js';

interface DailyForecastRow {
  resortId: number;
  date: string;
  snowfall: number | null;
  tempHigh: number | null;
  tempLow: number | null;
  windSpeed: number | null;
  windDirection: string | null;
  cloudCover: number | null;
  precipProbability: number | null;
  freezingLevel: number | null;
  conditions: string | null;
  confidence: string;
  source: string;
}

interface HourlyForecastRow {
  resortId: number;
  datetime: Date;
  temperature: number | null;
  snowfall: number | null;
  precipitation: number | null;
  windSpeed: number | null;
  windDirection: number | null;
  cloudCover: number | null;
  freezingLevel: number | null;
}

function degreesToCardinal(degrees: number | null): string | null {
  if (degrees === null) return null;
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

function inferConditions(snowfall: number | null, precip: number | null): string {
  if (snowfall !== null && snowfall > 0.1) return 'snow';
  if (precip !== null && precip > 0.01) return 'rain';
  return 'clear';
}

/**
 * Assign confidence based on forecast day number.
 * Days 1-3: high, Days 4-7: medium, Days 8-16: low
 */
function assignConfidence(dayIndex: number): 'high' | 'medium' | 'low' {
  if (dayIndex < 3) return 'high';
  if (dayIndex < 7) return 'medium';
  return 'low';
}

export function transformForecast(
  resortId: number,
  raw: OpenMeteoResponse,
): { daily: DailyForecastRow[]; hourly: HourlyForecastRow[] } {
  // Transform daily data
  const daily: DailyForecastRow[] = raw.daily.time.map((date, i) => ({
    resortId,
    date,
    snowfall: raw.daily.snowfall_sum[i] ?? null,
    tempHigh: raw.daily.temperature_2m_max[i] ?? null,
    tempLow: raw.daily.temperature_2m_min[i] ?? null,
    windSpeed: raw.daily.wind_speed_10m_max[i] ?? null,
    windDirection: degreesToCardinal(raw.daily.wind_direction_10m_dominant[i] ?? null),
    cloudCover: null, // daily cloud cover not directly in Open-Meteo daily
    precipProbability: raw.daily.precipitation_probability_max[i] ?? null,
    freezingLevel: null,
    conditions: inferConditions(
      raw.daily.snowfall_sum[i] ?? null,
      raw.daily.precipitation_sum[i] ?? null,
    ),
    confidence: assignConfidence(i),
    source: 'open-meteo',
  }));

  // Transform hourly data
  const hourly: HourlyForecastRow[] = raw.hourly.time.map((time, i) => ({
    resortId,
    datetime: new Date(time),
    temperature: raw.hourly.temperature_2m[i] ?? null,
    snowfall: raw.hourly.snowfall[i] ?? null,
    precipitation: raw.hourly.precipitation[i] ?? null,
    windSpeed: raw.hourly.wind_speed_10m[i] ?? null,
    windDirection: raw.hourly.wind_direction_10m[i] ?? null,
    cloudCover: raw.hourly.cloud_cover[i] ?? null,
    freezingLevel: raw.hourly.freezing_level_height[i]
      ? Math.round(raw.hourly.freezing_level_height[i]! * 3.281) // meters to feet
      : null,
  }));

  return { daily, hourly };
}
