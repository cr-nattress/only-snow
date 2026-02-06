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
    const res = await this.fetch(`${this.baseUrl}${path}`);
    if (!res.ok) {
      throw new Error(`API request failed: ${res.status} ${res.statusText}`);
    }
    return res.json() as Promise<T>;
  }

  async getResorts(): Promise<ResortSummary[]> {
    return this.request<ResortSummary[]>('/api/resorts');
  }

  async getResort(id: number): Promise<ResortDetail> {
    return this.request<ResortDetail>(`/api/resorts/${id}`);
  }

  async getResortForecast(id: number): Promise<ForecastResponse> {
    return this.request<ForecastResponse>(`/api/resorts/${id}/forecast`);
  }

  async getRegions(): Promise<RegionSummary[]> {
    return this.request<RegionSummary[]>('/api/regions');
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
