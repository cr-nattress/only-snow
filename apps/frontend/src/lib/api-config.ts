/**
 * Centralized API configuration.
 *
 * In development, falls back to localhost:3000.
 * In production/preview, NEXT_PUBLIC_API_BASE_URL must be set in Vercel.
 */

function resolveApiBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (explicit) return explicit;

  // Only fall back to localhost in development
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }

  // In production/preview, use relative URLs (same-origin) as last resort
  return '';
}

export const API_BASE_URL = resolveApiBaseUrl();

export const DATA_SOURCE = process.env.NEXT_PUBLIC_DATA_SOURCE ?? 'mock';

export function isApiMode(): boolean {
  return DATA_SOURCE === 'api';
}
