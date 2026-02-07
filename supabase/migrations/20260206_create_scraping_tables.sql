-- Migration: Create scraping and data collection tables
-- Purpose: Store scraped data with PATCH update support (static vs dynamic data separation)
-- Created: 2026-02-06

-- Enable PostGIS for geographic queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================================
-- RESORTS TABLE (Static Data - Rarely Changes)
-- ============================================================================
CREATE TABLE IF NOT EXISTS resorts (
  id BIGSERIAL PRIMARY KEY,

  -- Basic Info (Static)
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  region TEXT, -- "Colorado", "Utah", etc.

  -- Location (Static)
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  location GEOGRAPHY(POINT, 4326), -- PostGIS geometry
  elevation_base_m INTEGER, -- meters
  elevation_summit_m INTEGER,
  timezone TEXT DEFAULT 'America/Denver',

  -- Stats (Semi-Static - Updated seasonally)
  vertical_drop_m INTEGER,
  total_acres INTEGER,
  total_runs INTEGER,
  total_lifts INTEGER,
  longest_run_km DECIMAL(5, 2),
  avg_annual_snowfall_cm INTEGER,

  -- Terrain % (Semi-Static)
  terrain_beginner_pct INTEGER,
  terrain_intermediate_pct INTEGER,
  terrain_advanced_pct INTEGER,

  -- Amenities (Static)
  night_skiing BOOLEAN DEFAULT false,
  snowmaking BOOLEAN DEFAULT false,
  ski_school BOOLEAN DEFAULT false,
  child_care BOOLEAN DEFAULT false,
  rental BOOLEAN DEFAULT false,

  -- Pass affiliations (Semi-Static)
  pass_types TEXT[], -- ['epic', 'ikon', 'indy', 'independent']

  -- Contact (Static)
  website TEXT,
  phone TEXT,
  address TEXT,

  -- Scraping config (Static)
  snow_report_url TEXT, -- Where to scrape snow report
  trail_status_url TEXT, -- Where to scrape trail/lift status

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT resorts_slug_unique UNIQUE(slug)
);

-- Indexes for performance
CREATE INDEX resorts_location_gist ON resorts USING GIST(location);
CREATE INDEX resorts_region_idx ON resorts(region);
CREATE INDEX resorts_slug_idx ON resorts(slug);

-- ============================================================================
-- SNOW_REPORTS TABLE (Dynamic Data - Updated Daily)
-- ============================================================================
CREATE TABLE IF NOT EXISTS snow_reports (
  id BIGSERIAL PRIMARY KEY,
  resort_id BIGINT NOT NULL REFERENCES resorts(id) ON DELETE CASCADE,
  report_date DATE NOT NULL,

  -- Status (Dynamic)
  open_flag INTEGER, -- 1=Open, 2=Closed, 3=Temp Closed, etc.
  opening_date DATE,
  closing_date DATE,

  -- Snow depths (Dynamic - changes daily)
  depth_base_cm INTEGER,
  depth_middle_cm INTEGER,
  depth_summit_cm INTEGER,

  -- Snowfall (Dynamic - changes daily)
  snowfall_24h_cm INTEGER,
  snowfall_48h_cm INTEGER,
  snowfall_72h_cm INTEGER,
  snowfall_7day_cm INTEGER,

  -- Lifts (Dynamic - changes daily)
  lifts_total INTEGER, -- Can change seasonally
  lifts_open INTEGER,

  -- Terrain (Dynamic - changes daily)
  runs_total INTEGER, -- Can change seasonally
  runs_open INTEGER,
  runs_beginner_pct INTEGER,
  runs_intermediate_pct INTEGER,
  runs_advanced_pct INTEGER,

  acres_total INTEGER,
  acres_open INTEGER,

  parks_total INTEGER,
  parks_open INTEGER,

  -- Surface conditions (Dynamic - changes daily)
  surface_type_summit INTEGER, -- 1-18 codes
  surface_type_base INTEGER,
  surface_description TEXT, -- "Powder", "Packed Powder", "Ice"

  -- Enhanced data (from other sources)
  snowpack_percent_normal INTEGER, -- From SNOTEL
  storm_severity TEXT, -- 'none', 'light', 'moderate', 'heavy', 'epic', 'chase'
  storm_score INTEGER, -- 0-100

  -- Data provenance
  data_source TEXT DEFAULT 'scraped', -- 'scraped', 'api', 'snotel', 'open-meteo'
  last_updated_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT snow_reports_resort_date_unique UNIQUE(resort_id, report_date)
);

CREATE INDEX snow_reports_resort_id_idx ON snow_reports(resort_id);
CREATE INDEX snow_reports_report_date_idx ON snow_reports(report_date DESC);
CREATE INDEX snow_reports_resort_date_idx ON snow_reports(resort_id, report_date DESC);

-- ============================================================================
-- SCRAPED_DATA TABLE (Raw Scraped Content + Extraction Results)
-- ============================================================================
CREATE TABLE IF NOT EXISTS scraped_data (
  id BIGSERIAL PRIMARY KEY,
  resort_id BIGINT NOT NULL REFERENCES resorts(id) ON DELETE CASCADE,

  -- Source info
  source_url TEXT NOT NULL,
  source_type TEXT, -- 'snow_report', 'trail_status', 'webcams'

  -- Raw data
  html_content TEXT, -- Raw HTML (for debugging/re-processing)
  html_hash TEXT, -- Hash of HTML content to detect changes

  -- Extracted data
  extracted_data JSONB, -- Parsed JSON from LLM
  extraction_method TEXT, -- 'llm', 'css-selector', 'regex'

  -- LLM details
  llm_model TEXT, -- e.g., 'claude-sonnet-4-5'
  llm_prompt_tokens INTEGER,
  llm_output_tokens INTEGER,
  llm_cost_usd DECIMAL(10, 6),

  -- Quality
  extraction_confidence DECIMAL(3, 2), -- 0.00-1.00
  extraction_errors JSONB, -- Any errors during extraction
  validation_status TEXT, -- 'valid', 'invalid', 'needs_review'

  -- Processing status
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,

  -- Metadata
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  scraper_version TEXT, -- Track code version

  -- Constraints
  CONSTRAINT scraped_data_resort_scraped_unique UNIQUE(resort_id, scraped_at)
);

CREATE INDEX scraped_data_resort_id_idx ON scraped_data(resort_id);
CREATE INDEX scraped_data_scraped_at_idx ON scraped_data(scraped_at DESC);
CREATE INDEX scraped_data_processed_idx ON scraped_data(processed) WHERE NOT processed;
CREATE INDEX scraped_data_html_hash_idx ON scraped_data(html_hash);

-- ============================================================================
-- SCRAPING_CONFIG TABLE (Configuration for Each Resort's Scraper)
-- ============================================================================
CREATE TABLE IF NOT EXISTS scraping_config (
  id BIGSERIAL PRIMARY KEY,
  resort_id BIGINT NOT NULL REFERENCES resorts(id) ON DELETE CASCADE UNIQUE,

  -- Scraping schedule
  enabled BOOLEAN DEFAULT true,
  scrape_frequency_hours INTEGER DEFAULT 24, -- How often to scrape
  last_scraped_at TIMESTAMPTZ,
  next_scrape_at TIMESTAMPTZ,

  -- Robots.txt compliance
  robots_txt_checked_at TIMESTAMPTZ,
  robots_txt_allowed BOOLEAN DEFAULT true,

  -- Rate limiting
  rate_limit_seconds INTEGER DEFAULT 2, -- Min seconds between requests

  -- Selectors (if using CSS selector method)
  selectors JSONB, -- Store CSS selectors for key data

  -- Status
  scraping_enabled BOOLEAN DEFAULT true,
  last_error TEXT,
  error_count INTEGER DEFAULT 0,
  consecutive_errors INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX scraping_config_resort_id_idx ON scraping_config(resort_id);
CREATE INDEX scraping_config_next_scrape_idx ON scraping_config(next_scrape_at) WHERE scraping_enabled;

-- ============================================================================
-- SCRAPING_BLACKLIST TABLE (Resorts That Explicitly Block Scraping)
-- ============================================================================
CREATE TABLE IF NOT EXISTS scraping_blacklist (
  domain TEXT PRIMARY KEY,
  resort_id BIGINT REFERENCES resorts(id) ON DELETE CASCADE,
  reason TEXT NOT NULL, -- 'robots_txt', 'tos_violation', 'dmca_takedown', 'manual'
  blacklisted_at TIMESTAMPTZ DEFAULT NOW(),
  blacklisted_by TEXT, -- 'system' or user email
  notes TEXT
);

-- ============================================================================
-- DATA_QUALITY_FLAGS TABLE (Track Data Quality Issues)
-- ============================================================================
CREATE TABLE IF NOT EXISTS data_quality_flags (
  id BIGSERIAL PRIMARY KEY,
  resort_id BIGINT NOT NULL REFERENCES resorts(id) ON DELETE CASCADE,
  data_type TEXT NOT NULL, -- 'snow_depth', 'lift_count', 'snowfall', etc.

  -- Flagged data
  flagged_value JSONB, -- The suspicious data point
  expected_range JSONB, -- {"min": 0, "max": 1000}
  actual_value TEXT,

  -- Context
  reason TEXT NOT NULL, -- Why it was flagged
  severity TEXT NOT NULL, -- 'error', 'warning', 'info'

  -- Resolution
  status TEXT DEFAULT 'open', -- 'open', 'resolved', 'false_positive'
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT,
  resolution_notes TEXT,

  -- Metadata
  flagged_at TIMESTAMPTZ DEFAULT NOW(),
  source_table TEXT, -- 'snow_reports', 'scraped_data'
  source_id BIGINT
);

CREATE INDEX data_quality_flags_resort_id_idx ON data_quality_flags(resort_id);
CREATE INDEX data_quality_flags_status_idx ON data_quality_flags(status) WHERE status = 'open';

-- ============================================================================
-- WEATHER_FORECASTS TABLE (From Free APIs like Open-Meteo)
-- ============================================================================
CREATE TABLE IF NOT EXISTS weather_forecasts (
  id BIGSERIAL PRIMARY KEY,
  resort_id BIGINT NOT NULL REFERENCES resorts(id) ON DELETE CASCADE,

  forecast_date DATE NOT NULL,
  forecast_generated_at TIMESTAMPTZ NOT NULL,
  elevation TEXT NOT NULL, -- 'base', 'mid', 'summit', or actual elevation in meters

  -- Daily weather
  temp_high_c INTEGER,
  temp_low_c INTEGER,
  snow_cm INTEGER, -- Expected snowfall
  rain_mm INTEGER,
  wind_speed_kmh INTEGER,
  wind_gust_kmh INTEGER,
  wind_direction_deg INTEGER, -- 0-360
  humidity_pct INTEGER,
  cloud_cover_pct INTEGER,

  -- Enhanced
  precipitation_type TEXT, -- 'snow', 'rain', 'mixed'
  freeze_level_m INTEGER, -- Meters (where rain turns to snow)
  weather_code INTEGER, -- WMO weather code

  -- Confidence
  forecast_confidence DECIMAL(3, 2), -- 0.00-1.00

  -- Data source
  source TEXT DEFAULT 'open-meteo', -- 'open-meteo', 'noaa', 'ecmwf'

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT weather_forecasts_unique UNIQUE(resort_id, forecast_date, elevation, source, forecast_generated_at)
);

CREATE INDEX weather_forecasts_resort_date_idx ON weather_forecasts(resort_id, forecast_date);
CREATE INDEX weather_forecasts_date_idx ON weather_forecasts(forecast_date DESC);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function: Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_resorts_updated_at BEFORE UPDATE ON resorts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_snow_reports_updated_at BEFORE UPDATE ON snow_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scraping_config_updated_at BEFORE UPDATE ON scraping_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View: Latest snow report for each resort
CREATE OR REPLACE VIEW latest_snow_reports AS
SELECT DISTINCT ON (resort_id)
  sr.*,
  r.name as resort_name,
  r.slug as resort_slug,
  r.region
FROM snow_reports sr
JOIN resorts r ON sr.resort_id = r.id
ORDER BY resort_id, report_date DESC, updated_at DESC;

-- View: Resorts needing scraping (based on schedule)
CREATE OR REPLACE VIEW resorts_to_scrape AS
SELECT
  r.id,
  r.name,
  r.slug,
  r.snow_report_url,
  sc.last_scraped_at,
  sc.next_scrape_at,
  sc.scrape_frequency_hours
FROM resorts r
JOIN scraping_config sc ON r.id = sc.resort_id
WHERE sc.scraping_enabled = true
  AND sc.robots_txt_allowed = true
  AND (sc.next_scrape_at IS NULL OR sc.next_scrape_at <= NOW())
  AND NOT EXISTS (
    SELECT 1 FROM scraping_blacklist sb
    WHERE sb.domain = regexp_replace(r.snow_report_url, '^https?://([^/]+).*', '\1')
  )
ORDER BY sc.next_scrape_at ASC NULLS FIRST;

-- ============================================================================
-- SAMPLE DATA (For Testing)
-- ============================================================================

-- Insert 10 test resorts
INSERT INTO resorts (name, slug, region, latitude, longitude, location, elevation_base_m, elevation_summit_m, snow_report_url, website, pass_types) VALUES
  ('Vail', 'vail', 'Colorado', 39.6403, -106.3742, ST_SetSRID(ST_MakePoint(-106.3742, 39.6403), 4326), 2475, 3527, 'https://www.vail.com/the-mountain/mountain-conditions/trail-and-lift-status.aspx', 'https://www.vail.com', ARRAY['epic']),
  ('Breckenridge', 'breckenridge', 'Colorado', 39.4817, -106.0384, ST_SetSRID(ST_MakePoint(-106.0384, 39.4817), 4326), 2926, 3962, 'https://www.breckenridge.com/the-mountain/mountain-conditions/snow-and-weather-report.aspx', 'https://www.breckenridge.com', ARRAY['epic']),
  ('Crested Butte', 'crested-butte', 'Colorado', 38.8997, -106.9658, ST_SetSRID(ST_MakePoint(-106.9658, 38.8997), 4326), 2775, 3707, 'https://www.skicb.com/the-mountain/mountain-report/', 'https://www.skicb.com', ARRAY['epic']),
  ('Aspen Mountain', 'aspen', 'Colorado', 39.1911, -106.8175, ST_SetSRID(ST_MakePoint(-106.8175, 39.1911), 4326), 2422, 3417, 'https://www.aspensnowmass.com/ski-snowboard/snow-report', 'https://www.aspensnowmass.com', ARRAY['ikon']),
  ('Jackson Hole', 'jackson-hole', 'Wyoming', 43.5870, -110.8280, ST_SetSRID(ST_MakePoint(-110.8280, 43.5870), 4326), 1924, 3185, 'https://www.jacksonhole.com/mountain-report.html', 'https://www.jacksonhole.com', ARRAY['ikon']),
  ('Alta', 'alta', 'Utah', 40.5885, -111.6377, ST_SetSRID(ST_MakePoint(-111.6377, 40.5885), 4326), 2603, 3215, 'https://www.alta.com/conditions/snow-and-weather-report', 'https://www.alta.com', ARRAY['ikon']),
  ('Loveland', 'loveland', 'Colorado', 39.6799, -105.8975, ST_SetSRID(ST_MakePoint(-105.8975, 39.6799), 4326), 3286, 3871, 'https://skiloveland.com/the-mountain/mountain-report/', 'https://skiloveland.com', ARRAY['independent']),
  ('Arapahoe Basin', 'arapahoe-basin', 'Colorado', 39.6425, -105.8717, ST_SetSRID(ST_MakePoint(-105.8717, 39.6425), 4326), 3286, 3978, 'https://www.arapahoebasin.com/snow-report/', 'https://www.arapahoebasin.com', ARRAY['ikon']),
  ('Steamboat', 'steamboat', 'Colorado', 40.4575, -106.8047, ST_SetSRID(ST_MakePoint(-106.8047, 40.4575), 4326), 2103, 3221, 'https://www.steamboat.com/the-mountain/mountain-report', 'https://www.steamboat.com', ARRAY['ikon']),
  ('Telluride', 'telluride', 'Colorado', 37.9375, -107.8123, ST_SetSRID(ST_MakePoint(-107.8123, 37.9375), 4326), 2659, 3831, 'https://www.tellurideskiresort.com/the-mountain/conditions-weather/', 'https://www.tellurideskiresort.com', ARRAY['epic'])
ON CONFLICT (slug) DO NOTHING;

-- Initialize scraping config for each resort
INSERT INTO scraping_config (resort_id, scrape_frequency_hours, next_scrape_at)
SELECT
  id,
  24, -- Scrape once per day
  NOW() -- Ready to scrape immediately
FROM resorts
ON CONFLICT (resort_id) DO NOTHING;

-- ============================================================================
-- GRANTS (Adjust based on your Supabase roles)
-- ============================================================================

-- Grant access to authenticated users (adjust as needed)
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
-- GRANT INSERT, UPDATE ON snow_reports TO authenticated;

COMMENT ON TABLE resorts IS 'Static resort data (location, stats, amenities) - rarely changes';
COMMENT ON TABLE snow_reports IS 'Dynamic snow conditions (updated daily) - PATCH updates only';
COMMENT ON TABLE scraped_data IS 'Raw scraped HTML + LLM extraction results';
COMMENT ON TABLE scraping_config IS 'Configuration for each resort scraper';
COMMENT ON TABLE scraping_blacklist IS 'Resorts that block or prohibit scraping';
COMMENT ON TABLE data_quality_flags IS 'Track suspicious or invalid data';
COMMENT ON TABLE weather_forecasts IS 'Weather forecasts from free APIs (Open-Meteo, NOAA)';
