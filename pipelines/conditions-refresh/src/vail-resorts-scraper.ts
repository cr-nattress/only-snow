/**
 * Scraper for Vail Resorts properties that use the FR.TerrainStatusFeed
 * JSON format embedded in their terrain-and-lift-status pages.
 *
 * Covers ~10 resorts including Vail, Beaver Creek, Breckenridge, Keystone,
 * Park City, Heavenly, Northstar, Kirkwood, Stowe, and Mount Snow.
 */

import { logger } from '@onlysnow/pipeline-core';

const log = logger;

// ---------------------------------------------------------------------------
// Types for the FR.TerrainStatusFeed JSON structure
// ---------------------------------------------------------------------------

interface TerrainStatusFeed {
  ResortId: number;
  GroomingAreas: GroomingArea[];
}

interface GroomingArea {
  Name: string;
  Trails: Trail[];
}

interface Trail {
  Name: string;
  Difficulty: number;
  IsOpen: boolean;
  IsGroomed: boolean;
}

// ---------------------------------------------------------------------------
// Result type
// ---------------------------------------------------------------------------

export interface TrailConditions {
  trailsOpen: number;
  trailsTotal: number;
}

// ---------------------------------------------------------------------------
// Resort slug → terrain status page URL mapping
// ---------------------------------------------------------------------------

export const RESORT_TO_TERRAIN_URL: Record<string, string> = {
  'vail': 'https://www.vail.com/the-mountain/mountain-conditions/terrain-and-lift-status.aspx',
  'beaver-creek': 'https://www.beavercreek.com/the-mountain/mountain-conditions/terrain-and-lift-status.aspx',
  'breckenridge': 'https://www.breckenridge.com/the-mountain/mountain-conditions/terrain-and-lift-status.aspx',
  'keystone': 'https://www.keystoneresort.com/the-mountain/mountain-conditions/terrain-and-lift-status.aspx',
  'park-city': 'https://www.parkcitymountain.com/the-mountain/mountain-conditions/terrain-and-lift-status.aspx',
  'heavenly': 'https://www.skiheavenly.com/the-mountain/mountain-conditions/terrain-and-lift-status.aspx',
  'northstar-california': 'https://www.northstarcalifornia.com/the-mountain/mountain-conditions/terrain-and-lift-status.aspx',
  'kirkwood': 'https://www.kirkwood.com/the-mountain/mountain-conditions/terrain-and-lift-status.aspx',
  'stowe': 'https://www.stowe.com/the-mountain/mountain-conditions/terrain-and-lift-status.aspx',
  'mount-snow': 'https://www.mountsnow.com/the-mountain/mountain-conditions/terrain-and-lift-status.aspx',
};

// ---------------------------------------------------------------------------
// Scraper
// ---------------------------------------------------------------------------

/**
 * Fetch trail status from a Vail Resorts terrain page.
 * Extracts the FR.TerrainStatusFeed JSON and counts open/total trails.
 */
export async function fetchTrailConditions(resortSlug: string): Promise<TrailConditions | null> {
  const url = RESORT_TO_TERRAIN_URL[resortSlug];
  if (!url) return null;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'OnlySnow/1.0 (ski conditions aggregator)',
      },
    });

    if (!response.ok) {
      log.warn(`Terrain page returned ${response.status} for ${resortSlug}`);
      return null;
    }

    const html = await response.text();
    const feed = extractTerrainFeed(html);
    if (!feed) {
      log.warn(`No TerrainStatusFeed found for ${resortSlug}`);
      return null;
    }

    let trailsOpen = 0;
    let trailsTotal = 0;

    for (const area of feed.GroomingAreas) {
      for (const trail of area.Trails) {
        trailsTotal++;
        if (trail.IsOpen) trailsOpen++;
      }
    }

    return { trailsOpen, trailsTotal };
  } catch (error) {
    log.error(`Error scraping trail data for ${resortSlug}`, {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * Extract the FR.TerrainStatusFeed JSON from the page HTML.
 */
function extractTerrainFeed(html: string): TerrainStatusFeed | null {
  const marker = 'FR.TerrainStatusFeed = ';
  const startIdx = html.indexOf(marker);
  if (startIdx === -1) return null;

  const jsonStart = startIdx + marker.length;

  // Find the matching closing brace by counting braces
  let depth = 0;
  let jsonEnd = jsonStart;
  for (let i = jsonStart; i < html.length; i++) {
    if (html[i] === '{') depth++;
    if (html[i] === '}') depth--;
    if (depth === 0) {
      jsonEnd = i + 1;
      break;
    }
  }

  try {
    const jsonStr = html.slice(jsonStart, jsonEnd);
    return JSON.parse(jsonStr) as TerrainStatusFeed;
  } catch {
    return null;
  }
}
