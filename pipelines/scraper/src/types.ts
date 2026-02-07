// Type definitions for scraper pipeline

export interface Resort {
  id: number;
  name: string;
  slug: string;
  region: string;
  latitude: number;
  longitude: number;
  snow_report_url: string;
  website: string;
  pass_types: string[];
}

export interface ScrapingConfig {
  resort_id: number;
  enabled: boolean;
  scrape_frequency_hours: number;
  last_scraped_at: string | null;
  next_scrape_at: string | null;
  robots_txt_allowed: boolean;
  rate_limit_seconds: number;
}

export interface ScrapedData {
  id?: number;
  resort_id: number;
  url: string;
  html_content: string;
  html_hash: string;
  scraped_at: string;
  extraction_status: 'pending' | 'in_progress' | 'success' | 'failed';
  extraction_attempted_at: string | null;
  extracted_data: any | null;
  extraction_error: string | null;
}

export interface ExtractedSnowReport {
  report_date: string; // YYYY-MM-DD format

  // Snow depths (cm)
  depth_base_cm: number | null;
  depth_middle_cm: number | null;
  depth_summit_cm: number | null;

  // Snowfall (cm)
  snowfall_24h_cm: number | null;
  snowfall_48h_cm: number | null;
  snowfall_72h_cm: number | null;
  snowfall_7day_cm: number | null;

  // Lifts
  lifts_total: number | null;
  lifts_open: number | null;

  // Runs (trails)
  runs_total: number | null;
  runs_open: number | null;

  // Surface
  surface_description: string | null;

  // Status
  open_flag: number; // 1=Open, 0=Closed, 2=Partially Open

  // Extraction metadata
  confidence_score: number; // 0-100
  extraction_notes: string | null;
}

export interface SnowReport {
  id?: number;
  resort_id: number;
  report_date: string;

  // Status
  open_flag: number | null;
  opening_date?: string | null;
  closing_date?: string | null;

  // Snow depths (cm)
  depth_base_cm: number | null;
  depth_middle_cm: number | null;
  depth_summit_cm: number | null;

  // Snowfall (cm)
  snowfall_24h_cm: number | null;
  snowfall_48h_cm: number | null;
  snowfall_72h_cm: number | null;
  snowfall_7day_cm: number | null;

  // Lifts
  lifts_total: number | null;
  lifts_open: number | null;

  // Runs (terrain)
  runs_total: number | null;
  runs_open: number | null;
  runs_beginner_pct?: number | null;
  runs_intermediate_pct?: number | null;
  runs_advanced_pct?: number | null;

  // Acres
  acres_total?: number | null;
  acres_open?: number | null;

  // Parks
  parks_total?: number | null;
  parks_open?: number | null;

  // Surface
  surface_type_summit?: number | null;
  surface_type_base?: number | null;
  surface_description: string | null;

  // Enhanced data
  snowpack_percent_normal?: number | null;
  storm_severity?: string | null;
  storm_score?: number | null;

  // Provenance
  data_source: string;
  last_updated_at: string;

  // Metadata
  created_at?: string;
  updated_at?: string;
}

export interface PatchUpdate {
  table: string;
  id: number;
  updates: Record<string, any>;
  reason: string;
}

export interface ValidationRule {
  field: string;
  rule: (value: any, context?: any) => boolean;
  severity: 'error' | 'warning' | 'info';
  action: 'reject' | 'flag' | 'auto-fix';
  message: string;
}

export interface DataQualityFlag {
  id?: number;
  resort_id: number;
  flag_type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  metadata?: any;
  flagged_at?: string;
}

export interface ScraperStats {
  resorts_scraped: number;
  html_pages_fetched: number;
  llm_extractions: number;
  patch_updates: number;
  errors: number;
  total_cost_usd: number;
  duration_ms: number;
}
