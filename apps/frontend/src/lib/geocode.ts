/**
 * Geocode a location string to lat/lng coordinates
 * Uses the Open-Meteo geocoding API (free, no API key required)
 */
export async function geocodeLocation(location: string): Promise<{ lat: number; lng: number } | null> {
  if (!location) return null;

  try {
    const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
    url.searchParams.set('name', location);
    url.searchParams.set('count', '1');
    url.searchParams.set('language', 'en');
    url.searchParams.set('format', 'json');

    const res = await fetch(url.toString(), {
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (!data.results || data.results.length === 0) return null;

    return {
      lat: data.results[0].latitude,
      lng: data.results[0].longitude,
    };
  } catch {
    return null;
  }
}

/**
 * Convert drive time in minutes to approximate miles
 * Assumes average highway speed of 60 mph
 */
export function driveMinutesToMiles(minutes: number): number {
  return (minutes / 60) * 60; // (minutes / 60 hours) * 60 mph = miles
}
