import { ExternalApiError } from '@onlysnow/pipeline-core';

const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

export interface OpenMeteoRequest {
  lat: number;
  lng: number;
  elevation: number;
}

export interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  elevation: number;
  timezone: string;
  hourly: {
    time: string[];
    temperature_2m: (number | null)[];
    snowfall: (number | null)[];
    precipitation: (number | null)[];
    wind_speed_10m: (number | null)[];
    wind_direction_10m: (number | null)[];
    cloud_cover: (number | null)[];
    freezing_level_height: (number | null)[];
  };
  daily: {
    time: string[];
    temperature_2m_max: (number | null)[];
    temperature_2m_min: (number | null)[];
    snowfall_sum: (number | null)[];
    precipitation_sum: (number | null)[];
    wind_speed_10m_max: (number | null)[];
    wind_direction_10m_dominant: (number | null)[];
    precipitation_probability_max: (number | null)[];
  };
}

const HOURLY_PARAMS = [
  'temperature_2m',
  'snowfall',
  'precipitation',
  'wind_speed_10m',
  'wind_direction_10m',
  'cloud_cover',
  'freezing_level_height',
].join(',');

const DAILY_PARAMS = [
  'temperature_2m_max',
  'temperature_2m_min',
  'snowfall_sum',
  'precipitation_sum',
  'wind_speed_10m_max',
  'wind_direction_10m_dominant',
  'precipitation_probability_max',
].join(',');

export async function fetchOpenMeteoForecast(
  request: OpenMeteoRequest,
): Promise<OpenMeteoResponse> {
  const url = new URL(OPEN_METEO_BASE_URL);
  url.searchParams.set('latitude', request.lat.toString());
  url.searchParams.set('longitude', request.lng.toString());
  url.searchParams.set('elevation', request.elevation.toString());
  url.searchParams.set('hourly', HOURLY_PARAMS);
  url.searchParams.set('daily', DAILY_PARAMS);
  url.searchParams.set('temperature_unit', 'fahrenheit');
  url.searchParams.set('wind_speed_unit', 'mph');
  url.searchParams.set('precipitation_unit', 'inch');
  url.searchParams.set('forecast_days', '16');
  url.searchParams.set('timezone', 'America/Denver');

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new ExternalApiError(
      'open-meteo',
      response.status,
      `Open-Meteo API returned ${response.status}: ${response.statusText}`,
    );
  }

  return response.json() as Promise<OpenMeteoResponse>;
}
