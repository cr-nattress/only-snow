// Database client for Supabase
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  Resort,
  ScrapedData,
  SnowReport,
  DataQualityFlag,
  PatchUpdate
} from './types.js';

export class Database {
  private client: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    }

    this.client = createClient(supabaseUrl, supabaseKey);
  }

  // ============================================================================
  // RESORTS
  // ============================================================================

  async getResortsToScrape(): Promise<Resort[]> {
    const { data, error } = await this.client
      .from('resorts_to_scrape')
      .select('*')
      .limit(300);

    if (error) throw error;
    return data as Resort[];
  }

  async getResortById(id: number): Promise<Resort | null> {
    const { data, error } = await this.client
      .from('resorts')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as Resort | null;
  }

  // ============================================================================
  // SCRAPED DATA
  // ============================================================================

  async insertScrapedData(data: Omit<ScrapedData, 'id'>): Promise<ScrapedData> {
    const { data: inserted, error } = await this.client
      .from('scraped_data')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return inserted as ScrapedData;
  }

  async getLatestScrapedData(resortId: number): Promise<ScrapedData | null> {
    const { data, error } = await this.client
      .from('scraped_data')
      .select('*')
      .eq('resort_id', resortId)
      .order('scraped_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as ScrapedData | null;
  }

  async updateScrapedData(id: number, updates: Partial<ScrapedData>): Promise<void> {
    const { error } = await this.client
      .from('scraped_data')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  }

  // ============================================================================
  // SNOW REPORTS
  // ============================================================================

  async getLatestSnowReport(resortId: number): Promise<SnowReport | null> {
    const { data, error } = await this.client
      .from('snow_reports')
      .select('*')
      .eq('resort_id', resortId)
      .order('report_date', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as SnowReport | null;
  }

  async upsertSnowReport(report: Omit<SnowReport, 'id' | 'created_at' | 'updated_at'>): Promise<SnowReport> {
    const { data, error } = await this.client
      .from('snow_reports')
      .upsert(report, {
        onConflict: 'resort_id,report_date',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) throw error;
    return data as SnowReport;
  }

  // ============================================================================
  // PATCH UPDATES (Incremental Updates)
  // ============================================================================

  async patchSnowReport(
    resortId: number,
    reportDate: string,
    updates: Partial<SnowReport>
  ): Promise<SnowReport> {
    // Get existing report
    const existing = await this.getSnowReportByDate(resortId, reportDate);

    if (!existing) {
      // No existing report, create new one
      return this.upsertSnowReport({
        resort_id: resortId,
        report_date: reportDate,
        data_source: updates.data_source || 'scraped',
        last_updated_at: new Date().toISOString(),
        ...updates,
        open_flag: updates.open_flag || 1
      } as Omit<SnowReport, 'id' | 'created_at' | 'updated_at'>);
    }

    // Compare existing vs new values
    const changedFields: Record<string, any> = {};
    const staticFields = ['resort_id', 'report_date', 'id', 'created_at'];

    for (const [key, value] of Object.entries(updates)) {
      if (staticFields.includes(key)) continue;
      if (value !== undefined && value !== null && existing[key as keyof SnowReport] !== value) {
        changedFields[key] = value;
      }
    }

    // If nothing changed, return existing
    if (Object.keys(changedFields).length === 0) {
      console.log(`[PATCH] No changes for resort ${resortId} on ${reportDate}`);
      return existing;
    }

    // Update only changed fields
    console.log(`[PATCH] Updating ${Object.keys(changedFields).length} fields for resort ${resortId}:`, Object.keys(changedFields));

    const { data, error } = await this.client
      .from('snow_reports')
      .update({
        ...changedFields,
        updated_at: new Date().toISOString()
      })
      .eq('resort_id', resortId)
      .eq('report_date', reportDate)
      .select()
      .single();

    if (error) throw error;
    return data as SnowReport;
  }

  private async getSnowReportByDate(resortId: number, reportDate: string): Promise<SnowReport | null> {
    const { data, error } = await this.client
      .from('snow_reports')
      .select('*')
      .eq('resort_id', resortId)
      .eq('report_date', reportDate)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as SnowReport | null;
  }

  // ============================================================================
  // SCRAPING CONFIG
  // ============================================================================

  async updateScrapingConfig(resortId: number, updates: any): Promise<void> {
    const { error } = await this.client
      .from('scraping_config')
      .update(updates)
      .eq('resort_id', resortId);

    if (error) throw error;
  }

  async updateNextScrapeTime(resortId: number, frequencyHours: number): Promise<void> {
    const nextScrape = new Date();
    nextScrape.setHours(nextScrape.getHours() + frequencyHours);

    await this.updateScrapingConfig(resortId, {
      last_scraped_at: new Date().toISOString(),
      next_scrape_at: nextScrape.toISOString()
    });
  }

  // ============================================================================
  // QUALITY FLAGS
  // ============================================================================

  async flagDataQuality(flag: Omit<DataQualityFlag, 'id' | 'flagged_at'>): Promise<void> {
    const { error } = await this.client
      .from('data_quality_flags')
      .insert({
        ...flag,
        flagged_at: new Date().toISOString()
      });

    if (error) throw error;
  }

  // ============================================================================
  // BLACKLIST
  // ============================================================================

  async isBlacklisted(domain: string): Promise<boolean> {
    const { data, error } = await this.client
      .from('scraping_blacklist')
      .select('domain')
      .eq('domain', domain)
      .single();

    if (error && error.code !== 'PGRST116') return false;
    return !!data;
  }

  async addToBlacklist(
    domain: string,
    resortId: number,
    reason: string,
    notes?: string
  ): Promise<void> {
    const { error } = await this.client
      .from('scraping_blacklist')
      .insert({
        domain,
        resort_id: resortId,
        reason,
        notes,
        blacklisted_by: 'system',
        blacklisted_at: new Date().toISOString()
      });

    if (error && error.code !== '23505') throw error; // Ignore duplicate errors
  }
}
