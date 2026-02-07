// Playwright-based scraper with robots.txt compliance and rate limiting
import { chromium, Browser, Page } from 'playwright';
import robotsParser from 'robots-parser';
import { createHash } from 'crypto';
import { Database } from './database.js';
import type { Resort, ScrapedData } from './types.js';

// ============================================================================
// RATE LIMITER
// ============================================================================

class RateLimiter {
  private lastRequestTime = 0;
  private readonly minDelayMs: number;

  constructor(requestsPerSecond: number = 0.5) {
    this.minDelayMs = 1000 / requestsPerSecond;
  }

  async wait(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.minDelayMs) {
      const delay = this.minDelayMs - timeSinceLastRequest;
      console.log(`[RATE LIMIT] Waiting ${delay}ms before next request`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    this.lastRequestTime = Date.now();
  }
}

// ============================================================================
// ROBOTS.TXT CHECKER
// ============================================================================

async function checkRobotsTxt(url: string, userAgent: string = 'OnlySnowBot/1.0'): Promise<boolean> {
  try {
    const urlObj = new URL(url);
    const robotsUrl = `${urlObj.protocol}//${urlObj.host}/robots.txt`;

    const response = await fetch(robotsUrl);
    if (!response.ok) {
      console.log(`[ROBOTS.TXT] No robots.txt found at ${robotsUrl}, assuming allowed`);
      return true;
    }

    const robotsTxt = await response.text();
    const robots = robotsParser(robotsUrl, robotsTxt);

    const allowed = robots.isAllowed(url, userAgent);
    console.log(`[ROBOTS.TXT] ${url} is ${allowed ? 'ALLOWED' : 'DISALLOWED'} for ${userAgent}`);

    return allowed ?? true;
  } catch (error) {
    console.error(`[ROBOTS.TXT] Error checking robots.txt for ${url}:`, error);
    return true; // Assume allowed on error
  }
}

// ============================================================================
// HTML HASH GENERATOR
// ============================================================================

function generateHtmlHash(html: string): string {
  return createHash('sha256').update(html).digest('hex');
}

// ============================================================================
// SCRAPER CLASS
// ============================================================================

export class Scraper {
  private browser: Browser | null = null;
  private rateLimiter: RateLimiter;
  private db: Database;
  private userAgent = 'OnlySnowBot/1.0 (+https://onlysnow.com/bot)';

  constructor(requestsPerSecond: number = 0.5) {
    this.rateLimiter = new RateLimiter(requestsPerSecond);
    this.db = new Database();
  }

  async initialize(): Promise<void> {
    console.log('[SCRAPER] Launching browser...');
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    console.log('[SCRAPER] Browser ready');
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      console.log('[SCRAPER] Browser closed');
    }
  }

  async scrapeResort(resort: Resort): Promise<ScrapedData | null> {
    if (!this.browser) {
      throw new Error('Browser not initialized. Call initialize() first.');
    }

    const { id: resortId, name, snow_report_url } = resort;

    if (!snow_report_url) {
      console.log(`[SCRAPER] No snow report URL for ${name}, skipping`);
      return null;
    }

    console.log(`\n[SCRAPER] Processing ${name} (ID: ${resortId})`);
    console.log(`[SCRAPER] URL: ${snow_report_url}`);

    // Check blacklist
    const domain = new URL(snow_report_url).hostname;
    const isBlacklisted = await this.db.isBlacklisted(domain);
    if (isBlacklisted) {
      console.log(`[SCRAPER] Domain ${domain} is blacklisted, skipping`);
      return null;
    }

    // Check robots.txt
    const robotsAllowed = await checkRobotsTxt(snow_report_url, this.userAgent);
    if (!robotsAllowed) {
      console.log(`[SCRAPER] Robots.txt disallows scraping for ${name}`);
      await this.db.addToBlacklist(
        domain,
        resortId,
        'robots_txt_disallow',
        `Robots.txt disallows ${this.userAgent}`
      );
      return null;
    }

    // Rate limit
    await this.rateLimiter.wait();

    // Create new page
    const page = await this.browser.newPage({
      userAgent: this.userAgent,
      viewport: { width: 1920, height: 1080 }
    });

    try {
      console.log(`[SCRAPER] Navigating to ${snow_report_url}...`);
      await page.goto(snow_report_url, {
        waitUntil: 'domcontentloaded',
        timeout: 60000
      });

      // Wait for JS-rendered content — most resort sites are SPAs
      // Wait up to 15s for body to have substantial content
      try {
        await page.waitForFunction(
          '(document.body?.innerText?.length ?? 0) > 500',
          { timeout: 15000 }
        );
        console.log(`[SCRAPER] Page content rendered`);
      } catch {
        console.log(`[SCRAPER] Timed out waiting for content render, proceeding with what we have`);
      }

      // Get HTML content
      const html = await page.content();
      const htmlHash = generateHtmlHash(html);

      console.log(`[SCRAPER] Retrieved ${html.length} bytes of HTML`);
      console.log(`[SCRAPER] HTML hash: ${htmlHash.substring(0, 16)}...`);

      // Check if content has changed
      const latestScrape = await this.db.getLatestScrapedData(resortId);
      if (latestScrape && latestScrape.html_hash === htmlHash) {
        console.log(`[SCRAPER] Content unchanged for ${name}, skipping extraction`);
        await this.db.updateScrapingConfig(resortId, {
          last_scraped_at: new Date().toISOString(),
          last_scrape_status: 'success_unchanged'
        });
        return latestScrape;
      }

      // Save scraped data
      const scrapedData = await this.db.insertScrapedData({
        resort_id: resortId,
        url: snow_report_url,
        html_content: html,
        html_hash: htmlHash,
        scraped_at: new Date().toISOString(),
        extraction_status: 'pending',
        extraction_attempted_at: null,
        extracted_data: null,
        extraction_error: null
      });

      console.log(`[SCRAPER] Saved scraped data (ID: ${scrapedData.id})`);

      // Update scraping config
      await this.db.updateScrapingConfig(resortId, {
        last_scraped_at: new Date().toISOString(),
        last_scrape_status: 'success'
      });

      return scrapedData;

    } catch (error) {
      console.error(`[SCRAPER] Error scraping ${name}:`, error);

      // Update scraping config with error
      await this.db.updateScrapingConfig(resortId, {
        last_scraped_at: new Date().toISOString(),
        last_scrape_status: 'error',
        last_scrape_error: error instanceof Error ? error.message : String(error)
      });

      // Flag quality issue
      await this.db.flagDataQuality({
        resort_id: resortId,
        flag_type: 'scraping_error',
        severity: 'high',
        description: `Failed to scrape ${name}`,
        metadata: { error: error instanceof Error ? error.message : String(error) }
      });

      return null;

    } finally {
      await page.close();
    }
  }

  async scrapeAll(resorts: Resort[]): Promise<{
    success: number;
    unchanged: number;
    failed: number;
    blacklisted: number;
  }> {
    const stats = {
      success: 0,
      unchanged: 0,
      failed: 0,
      blacklisted: 0
    };

    console.log(`\n[SCRAPER] Starting batch scrape of ${resorts.length} resorts`);
    console.log('='.repeat(80));

    for (const resort of resorts) {
      try {
        const result = await this.scrapeResort(resort);

        if (result === null) {
          const domain = resort.snow_report_url ? new URL(resort.snow_report_url).hostname : null;
          const isBlacklisted = domain ? await this.db.isBlacklisted(domain) : false;

          if (isBlacklisted) {
            stats.blacklisted++;
          } else {
            stats.failed++;
          }
        } else {
          const latestScrape = await this.db.getLatestScrapedData(resort.id);
          if (latestScrape && latestScrape.id !== result.id && latestScrape.html_hash === result.html_hash) {
            stats.unchanged++;
          } else {
            stats.success++;
          }
        }
      } catch (error) {
        console.error(`[SCRAPER] Unexpected error for ${resort.name}:`, error);
        stats.failed++;
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('[SCRAPER] Batch scrape complete');
    console.log(`  Success: ${stats.success}`);
    console.log(`  Unchanged: ${stats.unchanged}`);
    console.log(`  Failed: ${stats.failed}`);
    console.log(`  Blacklisted: ${stats.blacklisted}`);
    console.log('='.repeat(80) + '\n');

    return stats;
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

export async function scrapeTestResorts(): Promise<void> {
  const db = new Database();
  const scraper = new Scraper(0.5); // 1 request per 2 seconds

  try {
    await scraper.initialize();

    // Get resorts to scrape from view
    const resorts = await db.getResortsToScrape();
    console.log(`[SCRAPER] Found ${resorts.length} resorts to scrape`);

    await scraper.scrapeAll(resorts);

  } finally {
    await scraper.close();
  }
}
