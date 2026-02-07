// Claude API extraction pipeline with structured outputs
import Anthropic from '@anthropic-ai/sdk';
import { Database } from './database.js';
import type { ScrapedData, ExtractedSnowReport, SnowReport } from './types.js';

// ============================================================================
// CLAUDE CLIENT (lazy init — env vars must be loaded before first use)
// ============================================================================

let _anthropic: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!_anthropic) {
    _anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
  }
  return _anthropic;
}

// ============================================================================
// EXTRACTION SCHEMA
// ============================================================================

const SNOW_REPORT_SCHEMA = {
  type: "object",
  properties: {
    report_date: {
      type: "string",
      description: "Date of the snow report in YYYY-MM-DD format"
    },
    depth_base_cm: {
      type: ["integer", "null"],
      description: "Base snow depth in centimeters"
    },
    depth_middle_cm: {
      type: ["integer", "null"],
      description: "Mid-mountain snow depth in centimeters"
    },
    depth_summit_cm: {
      type: ["integer", "null"],
      description: "Summit snow depth in centimeters"
    },
    snowfall_24h_cm: {
      type: ["integer", "null"],
      description: "Snowfall in last 24 hours in centimeters"
    },
    snowfall_48h_cm: {
      type: ["integer", "null"],
      description: "Snowfall in last 48 hours in centimeters"
    },
    snowfall_72h_cm: {
      type: ["integer", "null"],
      description: "Snowfall in last 72 hours in centimeters"
    },
    snowfall_7day_cm: {
      type: ["integer", "null"],
      description: "Snowfall in last 7 days in centimeters"
    },
    lifts_open: {
      type: ["integer", "null"],
      description: "Number of lifts currently open"
    },
    lifts_total: {
      type: ["integer", "null"],
      description: "Total number of lifts at resort"
    },
    runs_open: {
      type: ["integer", "null"],
      description: "Number of runs/trails currently open"
    },
    runs_total: {
      type: ["integer", "null"],
      description: "Total number of runs/trails at resort"
    },
    surface_description: {
      type: ["string", "null"],
      description: "Surface conditions description (e.g., 'powder', 'packed powder', 'groomed')"
    },
    open_flag: {
      type: "integer",
      description: "1 if resort is open, 0 if closed, 2 if partially open"
    },
    confidence_score: {
      type: "number",
      description: "Confidence score from 0-100 indicating extraction quality"
    },
    extraction_notes: {
      type: ["string", "null"],
      description: "Notes about extraction challenges or data quality issues"
    }
  },
  required: ["report_date", "open_flag", "confidence_score"]
};

// ============================================================================
// EXTRACTION PROMPT
// ============================================================================

const EXTRACTION_SYSTEM_PROMPT = `You are a ski resort data extraction specialist. Your job is to extract structured snow report data from HTML content.

EXTRACTION RULES:
1. Extract only factual data present in the HTML
2. Convert all snow measurements to CENTIMETERS (1 inch = 2.54 cm)
3. Use YYYY-MM-DD format for dates
4. If a field is not present or unclear, use null
5. For open_flag: 1 = fully open, 0 = closed, 2 = partially open
6. Assign confidence_score based on data clarity (100 = all fields clear, 0 = no data found)
7. Note any extraction challenges in extraction_notes

UNIT CONVERSION:
- ALWAYS convert inches to centimeters: multiply inches by 2.54
- ALWAYS convert feet to centimeters: multiply feet by 30.48
- Examples: 8" → 20 cm, 72" → 183 cm, 6' → 183 cm

SNOW MEASUREMENT GUIDELINES:
- 24h/48h/72h/7day are rolling window snowfall measurements
- Base depth is at the base area, summit depth is at the peak, middle is mid-mountain
- If only one depth is given, put it in depth_base_cm

OPERATIONAL DATA:
- lifts_open / lifts_total: e.g., "15 of 31 lifts open" → 15 and 31
- runs_open / runs_total: e.g., "100 of 195 trails open" → 100 and 195
- Note: "trails" and "runs" are synonymous

QUALITY CHECKS:
- Flag unrealistic values (e.g., 1500 cm in 24h) in extraction_notes
- Flag missing critical data in extraction_notes
- If multiple dates are present, use the most recent report date

Return only valid JSON matching the schema. Do not include any additional text or explanation.`;

// ============================================================================
// EXTRACTOR CLASS
// ============================================================================

export class Extractor {
  private db: Database;

  constructor() {
    this.db = new Database();
  }

  async extractSnowReport(
    resortId: number,
    resortName: string,
    html: string
  ): Promise<ExtractedSnowReport> {
    console.log(`[EXTRACTOR] Processing ${resortName} (ID: ${resortId})`);
    console.log(`[EXTRACTOR] HTML length: ${html.length} bytes`);

    // Extract body content and strip scripts/styles to reduce noise
    let cleanHtml = html;
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    if (bodyMatch) {
      cleanHtml = bodyMatch[1];
    }
    // Remove script/style/svg tags and their contents
    cleanHtml = cleanHtml
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, '')
      .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, '')
      .replace(/\s{2,}/g, ' ');

    console.log(`[EXTRACTOR] Cleaned HTML length: ${cleanHtml.length} bytes`);

    const startTime = Date.now();

    try {
      const response = await getAnthropicClient().messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 2000,
        temperature: 0,
        system: EXTRACTION_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Extract snow report data from this HTML content for ${resortName}. Use EXACTLY these JSON field names: report_date, depth_base_cm, depth_middle_cm, depth_summit_cm, snowfall_24h_cm, snowfall_48h_cm, snowfall_72h_cm, snowfall_7day_cm, lifts_open, lifts_total, runs_open, runs_total, surface_description, open_flag, confidence_score, extraction_notes.\n\nHTML:\n${cleanHtml.substring(0, 80000)}`
          }
        ]
      });

      const extractionTime = Date.now() - startTime;
      console.log(`[EXTRACTOR] Extraction completed in ${extractionTime}ms`);

      // Parse response
      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude API');
      }

      // Strip markdown code fences if present
      let jsonText = content.text.trim();
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
      }

      console.log(`[EXTRACTOR] Raw response: ${jsonText.substring(0, 500)}`);

      const raw = JSON.parse(jsonText);

      // Normalize field names — Claude sometimes uses alternate key patterns
      const pick = (...keys: string[]) => {
        for (const k of keys) {
          if (raw[k] !== undefined && raw[k] !== null) return raw[k];
        }
        return null;
      };

      const extracted: ExtractedSnowReport = {
        report_date: raw.report_date,
        depth_base_cm: pick('depth_base_cm', 'base_depth_cm'),
        depth_middle_cm: pick('depth_middle_cm', 'mid_depth_cm', 'midway_depth_cm'),
        depth_summit_cm: pick('depth_summit_cm', 'summit_depth_cm'),
        snowfall_24h_cm: pick('snowfall_24h_cm', 'snow_24h_cm', 'snow_last_24h_cm', 'new_snow_24h_cm'),
        snowfall_48h_cm: pick('snowfall_48h_cm', 'snow_48h_cm', 'snow_last_48h_cm', 'new_snow_48h_cm'),
        snowfall_72h_cm: pick('snowfall_72h_cm', 'snow_72h_cm', 'snow_last_72h_cm', 'new_snow_72h_cm'),
        snowfall_7day_cm: pick('snowfall_7day_cm', 'snow_7day_cm', 'snow_last_7d_cm', 'snow_7d_cm', 'new_snow_7day_cm'),
        lifts_open: pick('lifts_open'),
        lifts_total: pick('lifts_total'),
        runs_open: pick('runs_open', 'trails_open'),
        runs_total: pick('runs_total', 'trails_total'),
        surface_description: pick('surface_description', 'surface_condition', 'surface_conditions', 'snow_condition'),
        open_flag: raw.open_flag ?? 1,
        confidence_score: raw.confidence_score ?? 0,
        extraction_notes: raw.extraction_notes ?? null
      };

      // Default report_date to today if not extracted
      if (!extracted.report_date) {
        extracted.report_date = new Date().toISOString().split('T')[0];
        console.log(`[EXTRACTOR] No report_date found, defaulting to ${extracted.report_date}`);
      }

      // Log extraction results
      console.log(`[EXTRACTOR] Report date: ${extracted.report_date}`);
      console.log(`[EXTRACTOR] Confidence: ${extracted.confidence_score}`);
      console.log(`[EXTRACTOR] 24h: ${extracted.snowfall_24h_cm ?? 'N/A'} cm | 7d: ${extracted.snowfall_7day_cm ?? 'N/A'} cm`);
      console.log(`[EXTRACTOR] Base depth: ${extracted.depth_base_cm ?? 'N/A'} cm | Summit: ${extracted.depth_summit_cm ?? 'N/A'} cm`);
      console.log(`[EXTRACTOR] Lifts: ${extracted.lifts_open ?? '?'}/${extracted.lifts_total ?? '?'} | Runs: ${extracted.runs_open ?? '?'}/${extracted.runs_total ?? '?'}`);

      if (extracted.extraction_notes) {
        console.log(`[EXTRACTOR] Notes: ${extracted.extraction_notes}`);
      }

      // Flag low confidence extractions
      if (extracted.confidence_score < 50) {
        await this.db.flagDataQuality({
          resort_id: resortId,
          flag_type: 'low_confidence',
          severity: 'medium',
          description: `Low confidence extraction for ${resortName}`,
          metadata: {
            confidence_score: extracted.confidence_score,
            notes: extracted.extraction_notes
          }
        });
      }

      // Flag unrealistic values (>150 cm / ~60" in 24h is suspicious)
      if (extracted.snowfall_24h_cm && extracted.snowfall_24h_cm > 150) {
        await this.db.flagDataQuality({
          resort_id: resortId,
          flag_type: 'unrealistic_value',
          severity: 'high',
          description: `Unrealistic 24h snowfall: ${extracted.snowfall_24h_cm} cm`,
          metadata: { field: 'snowfall_24h_cm', value: extracted.snowfall_24h_cm }
        });
      }

      return extracted;

    } catch (error) {
      console.error(`[EXTRACTOR] Error extracting data for ${resortName}:`, error);
      throw error;
    }
  }

  async processScrapedData(scrapedData: ScrapedData): Promise<SnowReport | null> {
    const { id: scrapedId, resort_id: resortId, html_content } = scrapedData;

    if (!scrapedId) {
      throw new Error('ScrapedData id is required');
    }

    // Get resort info
    const resort = await this.db.getResortById(resortId);
    if (!resort) {
      throw new Error(`Resort ${resortId} not found`);
    }

    console.log(`\n[EXTRACTOR] Processing scraped data ID ${scrapedId} for ${resort.name}`);

    try {
      // Mark extraction as in progress
      await this.db.updateScrapedData(scrapedId, {
        extraction_status: 'in_progress',
        extraction_attempted_at: new Date().toISOString()
      });

      // Extract data using Claude
      const extracted = await this.extractSnowReport(
        resortId,
        resort.name,
        html_content
      );

      // Use PATCH update to only modify changed fields
      const snowReport = await this.db.patchSnowReport(
        resortId,
        extracted.report_date,
        {
          data_source: 'scraped',
          depth_base_cm: extracted.depth_base_cm,
          depth_middle_cm: extracted.depth_middle_cm,
          depth_summit_cm: extracted.depth_summit_cm,
          snowfall_24h_cm: extracted.snowfall_24h_cm,
          snowfall_48h_cm: extracted.snowfall_48h_cm,
          snowfall_72h_cm: extracted.snowfall_72h_cm,
          snowfall_7day_cm: extracted.snowfall_7day_cm,
          lifts_open: extracted.lifts_open,
          lifts_total: extracted.lifts_total,
          runs_open: extracted.runs_open,
          runs_total: extracted.runs_total,
          surface_description: extracted.surface_description,
          open_flag: extracted.open_flag,
          last_updated_at: new Date().toISOString()
        }
      );

      // Mark extraction as successful
      await this.db.updateScrapedData(scrapedId, {
        extraction_status: 'success',
        extracted_data: extracted
      });

      console.log(`[EXTRACTOR] Successfully processed ${resort.name}`);
      return snowReport;

    } catch (error) {
      console.error(`[EXTRACTOR] Failed to process ${resort.name}:`, error);

      // Mark extraction as failed
      await this.db.updateScrapedData(scrapedId, {
        extraction_status: 'failed',
        extraction_error: error instanceof Error ? error.message : String(error)
      });

      // Flag quality issue
      await this.db.flagDataQuality({
        resort_id: resortId,
        flag_type: 'extraction_error',
        severity: 'high',
        description: `Failed to extract data for ${resort.name}`,
        metadata: { error: error instanceof Error ? error.message : String(error) }
      });

      return null;
    }
  }

  async processPendingExtractions(): Promise<{
    success: number;
    failed: number;
  }> {
    const db = new Database();

    // Get all pending scraped data
    const { data, error } = await (db as any).client
      .from('scraped_data')
      .select('*')
      .eq('extraction_status', 'pending')
      .order('scraped_at', { ascending: true });

    if (error) throw error;

    const pending = data as ScrapedData[];
    console.log(`\n[EXTRACTOR] Found ${pending.length} pending extractions`);
    console.log('='.repeat(80));

    const stats = { success: 0, failed: 0 };

    for (const scraped of pending) {
      try {
        const result = await this.processScrapedData(scraped);
        if (result) {
          stats.success++;
        } else {
          stats.failed++;
        }
      } catch (error) {
        console.error(`[EXTRACTOR] Unexpected error:`, error);
        stats.failed++;
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('[EXTRACTOR] Batch extraction complete');
    console.log(`  Success: ${stats.success}`);
    console.log(`  Failed: ${stats.failed}`);
    console.log('='.repeat(80) + '\n');

    return stats;
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

export async function extractPendingReports(): Promise<void> {
  const extractor = new Extractor();
  await extractor.processPendingExtractions();
}
