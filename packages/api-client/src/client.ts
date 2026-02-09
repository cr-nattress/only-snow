import type {
  ResortSummary,
  ResortDetail,
  ForecastResponse,
  RegionSummary,
  RegionComparison,
  SnowRanking,
  ChaseAlert,
  TripEstimate,
  UserPreferences,
} from '@onlysnow/types';

export interface OnlySnowApiClientOptions {
  baseUrl: string;
  fetch?: typeof globalThis.fetch;
}

export class OnlySnowApiClient {
  private baseUrl: string;
  private fetch: typeof globalThis.fetch;

  constructor(options: OnlySnowApiClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.fetch = options.fetch ?? globalThis.fetch.bind(globalThis);
  }

  private async request<T>(path: string): Promise<T> {
    const res = await this.fetch(`${this.baseUrl}${path}`, {
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      throw new Error(`API request failed: ${res.status} ${res.statusText}`);
    }
    return res.json() as Promise<T>;
  }

  async getResorts(filters?: {
    lat?: number;
    lng?: number;
    radiusMiles?: number;
    passType?: string;
  }): Promise<ResortSummary[]> {
    const params = new URLSearchParams();
    if (filters?.lat != null) params.set('lat', String(filters.lat));
    if (filters?.lng != null) params.set('lng', String(filters.lng));
    if (filters?.radiusMiles != null) params.set('radiusMiles', String(filters.radiusMiles));
    if (filters?.passType) params.set('passType', filters.passType);
    const qs = params.toString();
    return this.request<ResortSummary[]>(`/api/resorts${qs ? `?${qs}` : ''}`);
  }

  async getResort(id: number | string): Promise<ResortDetail> {
    return this.request<ResortDetail>(`/api/resorts/${id}`);
  }

  async getResortForecast(id: number | string): Promise<ForecastResponse> {
    return this.request<ForecastResponse>(`/api/resorts/${id}/forecast`);
  }

  async getRegions(filters?: {
    lat?: number;
    lng?: number;
  }): Promise<RegionSummary[]> {
    const params = new URLSearchParams();
    if (filters?.lat != null) params.set('lat', String(filters.lat));
    if (filters?.lng != null) params.set('lng', String(filters.lng));
    const qs = params.toString();
    return this.request<RegionSummary[]>(`/api/regions${qs ? `?${qs}` : ''}`);
  }

  async getRegionComparison(id: number): Promise<RegionComparison> {
    return this.request<RegionComparison>(`/api/regions/${id}/compare`);
  }

  async getSnowRankings(): Promise<SnowRanking[]> {
    return this.request<SnowRanking[]>('/api/rankings/snow');
  }

  async getChaseAlerts(): Promise<ChaseAlert[]> {
    return this.request<ChaseAlert[]>('/api/chase/alerts');
  }

  async getTripEstimate(region: string): Promise<TripEstimate> {
    return this.request<TripEstimate>(`/api/chase/${region}/trip`);
  }

  async getUserPreferences(): Promise<UserPreferences> {
    return this.request<UserPreferences>('/api/user/preferences');
  }
}
