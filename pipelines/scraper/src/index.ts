#!/usr/bin/env node
// Main orchestrator for OnlySnow scraper pipeline
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load .env — try local scraper .env first, then monorepo root
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env') });
config({ path: resolve(__dirname, '../../../.env') });

// Map NEXT_PUBLIC_SUPABASE_URL → SUPABASE_URL if not set directly
if (!process.env.SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL) {
  process.env.SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
}

import { Scraper } from './scraper.js';
import { Extractor } from './extractor.js';
import { Database } from './database.js';

// ============================================================================
// PIPELINE ORCHESTRATOR
// ============================================================================

export class Pipeline {
  private scraper: Scraper;
  private extractor: Extractor;
  private db: Database;

  constructor(requestsPerSecond: number = 0.5) {
    this.scraper = new Scraper(requestsPerSecond);
    this.extractor = new Extractor();
    this.db = new Database();
  }

  async runFullPipeline(resortIds?: number[]): Promise<void> {
    console.log('\n' + '='.repeat(80));
    console.log('ONLYSNOW DATA PIPELINE - FULL RUN');
    console.log('='.repeat(80) + '\n');

    const startTime = Date.now();

    try {
      // Initialize browser
      await this.scraper.initialize();

      // Get resorts to scrape
      let resorts = await this.db.getResortsToScrape();

      if (resortIds && resortIds.length > 0) {
        resorts = resorts.filter(r => resortIds.includes(r.id));
        console.log(`[PIPELINE] Filtered to ${resorts.length} specific resorts`);
      }

      console.log(`[PIPELINE] Starting full pipeline for ${resorts.length} resorts\n`);

      // STEP 1: Scrape
      console.log('STEP 1: SCRAPING');
      console.log('-'.repeat(80));
      const scrapeStats = await this.scraper.scrapeAll(resorts);

      // STEP 2: Extract
      console.log('\nSTEP 2: EXTRACTION');
      console.log('-'.repeat(80));
      const extractStats = await this.extractor.processPendingExtractions();

      // STEP 3: Report
      const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);

      console.log('\n' + '='.repeat(80));
      console.log('PIPELINE COMPLETE');
      console.log('='.repeat(80));
      console.log(`\nTotal time: ${totalTime}s`);
      console.log('\nScraping Results:');
      console.log(`  Success: ${scrapeStats.success}`);
      console.log(`  Unchanged: ${scrapeStats.unchanged}`);
      console.log(`  Failed: ${scrapeStats.failed}`);
      console.log(`  Blacklisted: ${scrapeStats.blacklisted}`);
      console.log('\nExtraction Results:');
      console.log(`  Success: ${extractStats.success}`);
      console.log(`  Failed: ${extractStats.failed}`);
      console.log('\n' + '='.repeat(80) + '\n');

      // STEP 4: Display sample results
      await this.displaySampleResults(resorts.slice(0, 3));

    } finally {
      await this.scraper.close();
    }
  }

  async runScrapeOnly(): Promise<void> {
    console.log('\n' + '='.repeat(80));
    console.log('ONLYSNOW DATA PIPELINE - SCRAPE ONLY');
    console.log('='.repeat(80) + '\n');

    try {
      await this.scraper.initialize();
      const resorts = await this.db.getResortsToScrape();
      await this.scraper.scrapeAll(resorts);
    } finally {
      await this.scraper.close();
    }
  }

  async runExtractOnly(): Promise<void> {
    console.log('\n' + '='.repeat(80));
    console.log('ONLYSNOW DATA PIPELINE - EXTRACT ONLY');
    console.log('='.repeat(80) + '\n');

    await this.extractor.processPendingExtractions();
  }

  private async displaySampleResults(resorts: any[]): Promise<void> {
    console.log('\n' + '='.repeat(80));
    console.log('SAMPLE RESULTS');
    console.log('='.repeat(80) + '\n');

    for (const resort of resorts) {
      const latest = await this.db.getLatestSnowReport(resort.id);
      if (!latest) continue;

      console.log(`\n${resort.name.toUpperCase()}`);
      console.log('-'.repeat(resort.name.length));
      console.log(`Report Date: ${latest.report_date}`);
      console.log(`Status: ${latest.open_flag === 1 ? 'OPEN' : latest.open_flag === 2 ? 'PARTIALLY OPEN' : 'CLOSED'}`);
      console.log(`\nSnow Data:`);
      console.log(`  24h: ${latest.snowfall_24h_cm ?? 'N/A'} cm  |  48h: ${latest.snowfall_48h_cm ?? 'N/A'} cm  |  7d: ${latest.snowfall_7day_cm ?? 'N/A'} cm`);
      console.log(`  Base: ${latest.depth_base_cm ?? 'N/A'} cm  |  Mid: ${latest.depth_middle_cm ?? 'N/A'} cm  |  Summit: ${latest.depth_summit_cm ?? 'N/A'} cm`);
      console.log(`\nOperations:`);
      console.log(`  Lifts: ${latest.lifts_open ?? '?'}/${latest.lifts_total ?? '?'}`);
      console.log(`  Runs: ${latest.runs_open ?? '?'}/${latest.runs_total ?? '?'}`);
      if (latest.surface_description) {
        console.log(`  Surface: ${latest.surface_description}`);
      }
    }

    console.log('\n' + '='.repeat(80) + '\n');
  }
}

// ============================================================================
// CLI COMMANDS
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  // Check required environment variables
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('ERROR: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ERROR: Missing ANTHROPIC_API_KEY');
    process.exit(1);
  }

  const pipeline = new Pipeline(0.5); // 1 request per 2 seconds

  try {
    switch (command) {
      case '--test':
      case 'test':
        // Run full pipeline on test resorts
        await pipeline.runFullPipeline();
        break;

      case '--all':
      case 'all':
        // Run full pipeline on all resorts
        await pipeline.runFullPipeline();
        break;

      case '--scrape':
      case 'scrape':
        // Scrape only
        await pipeline.runScrapeOnly();
        break;

      case '--extract':
      case 'extract':
        // Extract only (process pending)
        await pipeline.runExtractOnly();
        break;

      case '--resort':
      case 'resort':
        // Run pipeline for specific resort ID(s) — comma-separated or range (e.g., 1-20)
        const resortArg = args[1];
        let resortIds: number[] = [];
        if (resortArg.includes('-') && !resortArg.includes(',')) {
          const [start, end] = resortArg.split('-').map(Number);
          for (let i = start; i <= end; i++) resortIds.push(i);
        } else {
          resortIds = resortArg.split(',').map(Number);
        }
        if (resortIds.some(isNaN) || resortIds.length === 0) {
          console.error('ERROR: Invalid resort ID(s). Use: resort 1 or resort 1,2,3 or resort 1-20');
          process.exit(1);
        }
        await pipeline.runFullPipeline(resortIds);
        break;

      default:
        console.log(`
OnlySnow Data Pipeline

Usage:
  pnpm dev [command]

Commands:
  test              Run full pipeline on test resorts (default)
  all               Run full pipeline on all resorts
  scrape            Scrape resorts only (no extraction)
  extract           Extract pending scraped data only
  resort <id>       Run pipeline for specific resort ID

Examples:
  pnpm dev test              # Test with sample resorts
  pnpm dev resort 1          # Process Vail only
  pnpm dev scrape            # Scrape without extracting
  pnpm dev extract           # Extract pending data

Environment Variables Required:
  SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY
  ANTHROPIC_API_KEY
        `);
        break;
    }

  } catch (error) {
    console.error('\n[ERROR] Pipeline failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { Scraper, Extractor, Database };
