interface GeocodingResult {
  lat: number;
  lng: number;
}

/**
 * Geocode a location string (city name or "City, ST") to lat/lng
 * using the free Open-Meteo geocoding API.
 * Returns null if geocoding fails.
 */
export async function geocode(location: string): Promise<GeocodingResult | null> {
  try {
    const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
    url.searchParams.set('name', location);
    url.searchParams.set('count', '1');
    url.searchParams.set('language', 'en');
    url.searchParams.set('format', 'json');

    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(5000) });
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
