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

export interface MockApiHandlers {
  getResorts?: () => Promise<ResortSummary[]>;
  getResort?: (id: number) => Promise<ResortDetail>;
  getResortForecast?: (id: number) => Promise<ForecastResponse>;
  getRegions?: () => Promise<RegionSummary[]>;
  getRegionComparison?: (id: number) => Promise<RegionComparison>;
  getSnowRankings?: () => Promise<SnowRanking[]>;
  getChaseAlerts?: () => Promise<ChaseAlert[]>;
  getTripEstimate?: (region: string) => Promise<TripEstimate>;
  getUserPreferences?: () => Promise<UserPreferences>;
}

export class MockApiClient {
  private handlers: MockApiHandlers;

  constructor(handlers: MockApiHandlers = {}) {
    this.handlers = handlers;
  }

  private notImplemented(method: string): never {
    throw new Error(`MockApiClient: ${method} not implemented`);
  }

  async getResorts(): Promise<ResortSummary[]> {
    if (this.handlers.getResorts) return this.handlers.getResorts();
    this.notImplemented('getResorts');
  }

  async getResort(id: number): Promise<ResortDetail> {
    if (this.handlers.getResort) return this.handlers.getResort(id);
    this.notImplemented('getResort');
  }

  async getResortForecast(id: number): Promise<ForecastResponse> {
    if (this.handlers.getResortForecast) return this.handlers.getResortForecast(id);
    this.notImplemented('getResortForecast');
  }

  async getRegions(): Promise<RegionSummary[]> {
    if (this.handlers.getRegions) return this.handlers.getRegions();
    this.notImplemented('getRegions');
  }

  async getRegionComparison(id: number): Promise<RegionComparison> {
    if (this.handlers.getRegionComparison) return this.handlers.getRegionComparison(id);
    this.notImplemented('getRegionComparison');
  }

  async getSnowRankings(): Promise<SnowRanking[]> {
    if (this.handlers.getSnowRankings) return this.handlers.getSnowRankings();
    this.notImplemented('getSnowRankings');
  }

  async getChaseAlerts(): Promise<ChaseAlert[]> {
    if (this.handlers.getChaseAlerts) return this.handlers.getChaseAlerts();
    this.notImplemented('getChaseAlerts');
  }

  async getTripEstimate(region: string): Promise<TripEstimate> {
    if (this.handlers.getTripEstimate) return this.handlers.getTripEstimate(region);
    this.notImplemented('getTripEstimate');
  }

  async getUserPreferences(): Promise<UserPreferences> {
    if (this.handlers.getUserPreferences) return this.handlers.getUserPreferences();
    this.notImplemented('getUserPreferences');
  }
}
