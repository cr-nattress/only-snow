import { CacheKeys, CacheTTL, cache } from '@onlysnow/redis';
import type { RedisClient } from '@onlysnow/redis';

interface GeocodingResult {
  lat: number;
  lng: number;
}

/**
 * Geocode a location string (city name or "City, ST") to lat/lng
 * using the free Open-Meteo geocoding API.
 * Results are cached in Redis for 30 days when a redis client is provided.
 * Returns null if geocoding fails.
 */
export async function geocode(location: string, redis?: RedisClient | null): Promise<GeocodingResult | null> {
  // Check cache first
  if (redis) {
    const cacheKey = CacheKeys.geocode(location);
    const cached = await cache.get<GeocodingResult>(redis, cacheKey);
    if (cached) return cached;
  }

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

    const result: GeocodingResult = {
      lat: data.results[0].latitude,
      lng: data.results[0].longitude,
    };

    // Cache successful geocoding results
    if (redis) {
      await cache.set(redis, CacheKeys.geocode(location), result, CacheTTL.GEOCODE);
    }

    return result;
  } catch {
    return null;
  }
}
