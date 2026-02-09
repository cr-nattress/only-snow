/**
 * Fetch observed snowfall from Open-Meteo for the last 72 hours.
 * Uses the forecast API with past_days=3 and forecast_days=0
 * to get recent hourly snowfall data, then sums into 24h/48h/72h windows.
 */

import { logger } from '@onlysnow/pipeline-core';

const log = logger;

const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

interface OpenMeteoObservedResponse {
  hourly: {
    time: string[];
    snowfall: (number | null)[];
  };
}

export interface ObservedSnowfall {
  snowfall24h: number; // inches, last 24 hours
  snowfall48h: number; // inches, last 48 hours
  snowfall72h: number; // inches, last 72 hours
}

/**
 * Fetch observed snowfall for a resort location from Open-Meteo.
 * Returns snowfall totals in inches for the last 24h, 48h, and 72h.
 */
export async function fetchObservedSnowfall(
  lat: number,
  lng: number,
  elevationFt: number,
): Promise<ObservedSnowfall | null> {
  try {
    const elevationM = Math.round(elevationFt * 0.3048);
    const url = new URL(OPEN_METEO_BASE_URL);
    url.searchParams.set('latitude', lat.toString());
    url.searchParams.set('longitude', lng.toString());
    url.searchParams.set('elevation', elevationM.toString());
    url.searchParams.set('hourly', 'snowfall');
    url.searchParams.set('temperature_unit', 'fahrenheit');
    url.searchParams.set('precipitation_unit', 'inch');
    url.searchParams.set('past_days', '3');
    url.searchParams.set('forecast_days', '0');
    url.searchParams.set('timezone', 'America/Denver');

    const response = await fetch(url.toString());
    if (!response.ok) {
      log.warn(`Open-Meteo observed returned ${response.status}`);
      return null;
    }

    const data = (await response.json()) as OpenMeteoObservedResponse;
    const times = data.hourly?.time ?? [];
    const snowfall = data.hourly?.snowfall ?? [];

    if (times.length === 0) return null;

    // Sum snowfall for the last 24h, 48h, 72h
    const now = Date.now();
    let sum24h = 0;
    let sum48h = 0;
    let sum72h = 0;

    for (let i = 0; i < times.length; i++) {
      const value = snowfall[i];
      if (value == null || value <= 0) continue;

      const timestamp = new Date(times[i]).getTime();
      const hoursAgo = (now - timestamp) / (1000 * 60 * 60);

      if (hoursAgo <= 24) sum24h += value;
      if (hoursAgo <= 48) sum48h += value;
      if (hoursAgo <= 72) sum72h += value;
    }

    // Round to 1 decimal place
    return {
      snowfall24h: Math.round(sum24h * 10) / 10,
      snowfall48h: Math.round(sum48h * 10) / 10,
      snowfall72h: Math.round(sum72h * 10) / 10,
    };
  } catch (error) {
    log.error('Error fetching observed snowfall', {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}
