/**
 * Webcam URL discovery script.
 * Tries common webcam page paths against each resort's website domain.
 * Returns the first URL that responds with HTTP 200.
 */

import { logger } from '@onlysnow/pipeline-core';

const log = logger;

// Common webcam page paths used by ski resorts
const WEBCAM_PATHS = [
  '/webcams',
  '/the-mountain/webcams',
  '/the-mountain/mountain-cams',
  '/the-mountain/mountain-conditions/webcams',
  '/mountain-cams',
  '/mountain/webcams',
  '/mountain/mountain-cams',
  '/live-cams',
  '/conditions/webcams',
  '/conditions/mountain-cams',
  '/mountain-report/webcams',
  '/mountain-information/webcams',
  '/plan-your-trip/webcams',
  '/the-mountain/mountain-conditions/mountain-cams.aspx',
  '/explore-the-mountain/webcams',
  '/mountain/web-cams',
  '/web-cams',
];

// Known webcam URLs that don't follow common patterns
export const KNOWN_WEBCAM_URLS: Record<string, string> = {
  // Vail Resorts properties (use .aspx pattern)
  'vail': 'https://www.vail.com/the-mountain/mountain-conditions/mountain-cams.aspx',
  'beaver-creek': 'https://www.beavercreek.com/the-mountain/mountain-conditions/mountain-cams.aspx',
  'breckenridge': 'https://www.breckenridge.com/the-mountain/mountain-conditions/mountain-cams.aspx',
  'keystone': 'https://www.keystoneresort.com/the-mountain/mountain-conditions/mountain-cams.aspx',
  'park-city': 'https://www.parkcitymountain.com/the-mountain/mountain-conditions/mountain-cams.aspx',
  'heavenly': 'https://www.skiheavenly.com/the-mountain/mountain-conditions/mountain-cams.aspx',
  'northstar-california': 'https://www.northstarcalifornia.com/the-mountain/mountain-conditions/mountain-cams.aspx',
  'kirkwood': 'https://www.kirkwood.com/the-mountain/mountain-conditions/mountain-cams.aspx',
  'stowe': 'https://www.stowe.com/the-mountain/mountain-conditions/mountain-cams.aspx',
  'mount-snow': 'https://www.mountsnow.com/the-mountain/mountain-conditions/mountain-cams.aspx',
  // Alterra resorts
  'steamboat': 'https://www.steamboat.com/the-mountain/mountain-cams',
  'winter-park': 'https://www.winterparkresort.com/the-mountain/mountain-cams',
  'mammoth-mountain': 'https://www.mammothmountain.com/mountain-information/webcams',
  'deer-valley': 'https://www.deervalley.com/webcams',
  'palisades-tahoe': 'https://www.palisadestahoe.com/the-mountain/webcams',
  'big-sky': 'https://www.bigskyresort.com/the-mountain/mountain-cams',
  'sugarbush': 'https://www.sugarbush.com/the-mountain/webcams',
  // Major independents
  'snowbird': 'https://www.snowbird.com/mountain-report/#webcams',
  'alta': 'https://www.alta.com/conditions#cameras',
  'jackson-hole': 'https://www.jacksonhole.com/webcams',
  'telluride': 'https://www.tellurideskiresort.com/webcams/',
  'killington': 'https://www.killington.com/the-mountain/webcams',
  'jay-peak': 'https://www.jaypeakresort.com/mountain/webcams',
  'mt-bachelor': 'https://www.mtbachelor.com/conditions-cams/mountain-cams',
  'sun-valley': 'https://www.sunvalley.com/mountain-info/webcams',
  'taos-ski-valley': 'https://www.skitaos.com/conditions-cams',
  'crystal-mountain': 'https://www.crystalmountainresort.com/the-mountain/webcams',
  'stevens-pass': 'https://www.stevenspass.com/the-mountain/webcams',
  'arapahoe-basin': 'https://www.arapahoebasin.com/the-mountain/webcams/',
  'crested-butte': 'https://www.skicb.com/the-mountain/webcams',
  'solitude': 'https://www.solitudemountain.com/conditions-and-cams/webcams',
  'brighton': 'https://brightonresort.com/mountain-info/webcams',
  'snowbasin': 'https://www.snowbasin.com/mountain-report/webcams/',
  'sunday-river': 'https://www.sundayriver.com/mountain/webcams',
  'sugarloaf': 'https://www.sugarloaf.com/conditions/webcams',
  'loon-mountain': 'https://www.loonmtn.com/webcams',
  'cannon-mountain': 'https://www.cannonmt.com/conditions/webcams',
  'whiteface-mountain': 'https://www.whiteface.com/mountain/webcams',
  'mad-river-glen': 'https://www.madriverglen.com/mountain/webcam',
};

/**
 * Try to discover the webcam URL for a resort by testing common paths.
 * Returns the first URL that responds with HTTP 200, or null.
 */
export async function discoverWebcamUrl(
  resortSlug: string,
  websiteUrl: string,
): Promise<string | null> {
  // Check known URLs first
  if (KNOWN_WEBCAM_URLS[resortSlug]) {
    return KNOWN_WEBCAM_URLS[resortSlug];
  }

  // Normalize website URL (remove trailing slash)
  const baseUrl = websiteUrl.replace(/\/$/, '');

  for (const path of WEBCAM_PATHS) {
    const url = `${baseUrl}${path}`;
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        redirect: 'follow',
        signal: AbortSignal.timeout(5000),
        headers: { 'User-Agent': 'OnlySnow/1.0 (ski conditions aggregator)' },
      });
      if (response.ok) {
        return url;
      }
    } catch {
      // Connection error, timeout, etc. — try next path
    }
  }

  return null;
}
