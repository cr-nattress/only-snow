/**
 * Ski Resort Data Collection Script
 *
 * Uses the Anthropic API with web search to collect comprehensive
 * data for ski resorts using the schema from
 * research/SKI_RESORT_DATA_COLLECTION_PROMPT.md
 *
 * Usage:
 *   # Collect data for a single resort
 *   npx tsx scripts/collect-resort-data.ts "Vail"
 *
 *   # Collect data for all resorts in seed file
 *   npx tsx scripts/collect-resort-data.ts --all
 *
 *   # Collect and merge into seed file
 *   npx tsx scripts/collect-resort-data.ts --all --merge
 *
 * Requires: ANTHROPIC_API_KEY in .env
 */

import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SEED_FILE = resolve(ROOT, 'supabase/seed/resorts.json');
const RAW_DATA_DIR = resolve(ROOT, 'data/resorts');
const PROMPT_FILE = resolve(ROOT, 'research/SKI_RESORT_DATA_COLLECTION_PROMPT.md');

// Extract the JSON schema from the prompt file
function getCollectionPrompt(resortName: string): string {
  const promptMd = readFileSync(PROMPT_FILE, 'utf-8');
  // Extract content between ```  and ``` in the ## Prompt section
  const match = promptMd.match(/## Prompt\s+```\n([\s\S]*?)```/);
  if (!match) throw new Error('Could not extract prompt from SKI_RESORT_DATA_COLLECTION_PROMPT.md');
  return match[1].replace(/\{RESORT_NAME\}/g, resortName);
}

// Map comprehensive JSON to our simplified seed format
interface SeedResort {
  name: string;
  slug: string;
  lat: number;
  lng: number;
  elevationSummit: number;
  elevationBase: number;
  region: string;
  passType: string | null;
  totalLifts: number | null;
  totalTrails: number | null;
  terrainAcres: number | null;
  annualSnowfall: number | null;
  terrainProfile: { beginner: number; intermediate: number; advanced: number } | null;
  aspect: string | null;
  nightSkiing: boolean | null;
  snowmakingPercent: number | null;
  longestRun: number | null;
  terrainParks: number | null;
  nearestAirport: string | null;
  website: string | null;
  webcamUrl: string | null;
}

function mapToSeedFormat(raw: Record<string, unknown>, existing: SeedResort): Partial<SeedResort> {
  const elevation = raw.elevation as Record<string, number> | undefined;
  const terrain = raw.terrain as Record<string, unknown> | undefined;
  const breakdown = terrain?.terrain_breakdown_pct as Record<string, number> | undefined;
  const lifts = raw.lifts as Record<string, number> | undefined;
  const snow = raw.snow_and_weather as Record<string, unknown> | undefined;
  const nightSki = raw.night_skiing as Record<string, unknown> | undefined;
  const parks = raw.terrain_parks_and_features as Record<string, unknown> | undefined;
  const access = raw.accessibility_and_transportation as Record<string, unknown> | undefined;
  const location = raw.location as Record<string, unknown> | undefined;
  const ownership = raw.ownership_and_operations as Record<string, unknown> | undefined;
  const meta = raw.meta as Record<string, unknown> | undefined;

  // Determine pass type from multi_resort_pass_affiliations
  let passType = existing.passType;
  if (ownership?.multi_resort_pass_affiliations) {
    const passes = ownership.multi_resort_pass_affiliations as string[];
    const lower = passes.map(p => p.toLowerCase());
    if (lower.some(p => p.includes('epic'))) passType = 'epic';
    else if (lower.some(p => p.includes('ikon'))) passType = 'ikon';
    else if (lower.some(p => p.includes('indy'))) passType = 'indy';
    else passType = 'independent';
  }

  // Build terrain profile
  let terrainProfile: SeedResort['terrainProfile'] = null;
  if (breakdown) {
    const beginner = Math.round(breakdown.beginner_green ?? 0);
    const intermediate = Math.round(breakdown.intermediate_blue ?? 0);
    const advancedBlack = Math.round(breakdown.advanced_black ?? 0);
    const expert = Math.round(breakdown.expert_double_black ?? 0);
    terrainProfile = {
      beginner,
      intermediate,
      advanced: advancedBlack + expert,
    };
  }

  return {
    // Preserve existing identity fields
    name: (meta?.resort_name as string) ?? existing.name,
    lat: (location?.latitude as number) ?? existing.lat,
    lng: (location?.longitude as number) ?? existing.lng,
    elevationSummit: elevation?.summit_elevation_ft ?? existing.elevationSummit,
    elevationBase: elevation?.base_elevation_ft ?? existing.elevationBase,
    passType,

    // Overwrite with collected data
    totalLifts: lifts?.total_lifts ?? existing.totalLifts,
    totalTrails: (terrain?.total_named_trails as number) ?? existing.totalTrails,
    terrainAcres: (terrain?.skiable_acres as number) ?? existing.terrainAcres,
    annualSnowfall: (snow?.average_annual_snowfall_inches as number) ?? null,
    terrainProfile,
    nightSkiing: (nightSki?.available as boolean) ?? null,
    snowmakingPercent: (snow?.snowmaking_coverage_pct as number) ?? null,
    longestRun: (terrain?.longest_run_miles as number) ?? null,
    terrainParks: (parks?.terrain_parks_count as number) ?? null,
    nearestAirport: (access?.nearest_commercial_airport_code as string) ?? existing.nearestAirport,
    website: existing.website, // Keep existing — official websites don't change
  };
}

async function collectResortData(client: Anthropic, resortName: string): Promise<Record<string, unknown>> {
  const prompt = getCollectionPrompt(resortName);

  console.log(`  Querying API for ${resortName}...`);
  const response = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 8192,
    tools: [{
      type: 'web_search_20250305' as const,
      name: 'web_search',
      max_uses: 10,
    }],
    messages: [{
      role: 'user',
      content: prompt,
    }],
  });

  // Extract JSON from response text blocks
  const textBlocks = response.content.filter(b => b.type === 'text');
  const fullText = textBlocks.map(b => (b as { type: 'text'; text: string }).text).join('');

  // Try to extract JSON from the response
  const jsonMatch = fullText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`No JSON found in response for ${resortName}`);
  }

  const data = JSON.parse(jsonMatch[0]);

  // Log search usage
  const searchUses = (response.usage as Record<string, unknown>).server_tool_use as Record<string, number> | undefined;
  console.log(`  Searches used: ${searchUses?.web_search_requests ?? 0}`);

  return data;
}

async function main() {
  const args = process.argv.slice(2);
  const isAll = args.includes('--all');
  const isMerge = args.includes('--merge');
  const resortName = args.find(a => !a.startsWith('--'));

  if (!isAll && !resortName) {
    console.log('Usage:');
    console.log('  npx tsx scripts/collect-resort-data.ts "Resort Name"');
    console.log('  npx tsx scripts/collect-resort-data.ts --all [--merge]');
    process.exit(1);
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY not set. Add it to .env and use: dotenv -- npx tsx scripts/collect-resort-data.ts');
    process.exit(1);
  }

  const client = new Anthropic({ apiKey });

  // Ensure output directory exists
  if (!existsSync(RAW_DATA_DIR)) {
    mkdirSync(RAW_DATA_DIR, { recursive: true });
  }

  if (isAll) {
    // Process all resorts from seed file
    const seedResorts = JSON.parse(readFileSync(SEED_FILE, 'utf-8')) as SeedResort[];
    console.log(`Processing ${seedResorts.length} resorts...\n`);

    for (let i = 0; i < seedResorts.length; i++) {
      const resort = seedResorts[i];
      const outFile = resolve(RAW_DATA_DIR, `${resort.slug}.json`);

      // Skip if already collected (for resumability)
      if (existsSync(outFile)) {
        console.log(`[${i + 1}/${seedResorts.length}] ${resort.name} — already collected, skipping`);
        continue;
      }

      console.log(`[${i + 1}/${seedResorts.length}] ${resort.name}`);
      try {
        const rawData = await collectResortData(client, resort.name);
        writeFileSync(outFile, JSON.stringify(rawData, null, 2));
        console.log(`  Saved to ${outFile}\n`);

        // Rate limit: wait between requests
        if (i < seedResorts.length - 1) {
          await new Promise(r => setTimeout(r, 2000));
        }
      } catch (err) {
        console.error(`  ERROR: ${err instanceof Error ? err.message : String(err)}\n`);
      }
    }

    if (isMerge) {
      console.log('\nMerging collected data into seed file...');
      mergeIntoSeed(seedResorts);
    }
  } else {
    // Single resort
    console.log(`Collecting data for: ${resortName}`);
    const rawData = await collectResortData(client, resortName!);

    // Save raw data
    const slug = resortName!.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
    const outFile = resolve(RAW_DATA_DIR, `${slug}.json`);
    writeFileSync(outFile, JSON.stringify(rawData, null, 2));
    console.log(`\nSaved raw data to ${outFile}`);

    // Also print a summary
    const terrain = rawData.terrain as Record<string, unknown> | undefined;
    const snow = rawData.snow_and_weather as Record<string, unknown> | undefined;
    console.log('\nSummary:');
    console.log(`  Annual snowfall: ${snow?.average_annual_snowfall_inches ?? 'unknown'}"`)
    console.log(`  Skiable acres: ${terrain?.skiable_acres ?? 'unknown'}`);
    console.log(`  Trails: ${terrain?.total_named_trails ?? 'unknown'}`);
    console.log(`  Longest run: ${terrain?.longest_run_miles ?? 'unknown'} mi`);
  }
}

function mergeIntoSeed(seedResorts: SeedResort[]) {
  const updated = seedResorts.map(resort => {
    const rawFile = resolve(RAW_DATA_DIR, `${resort.slug}.json`);
    if (!existsSync(rawFile)) {
      console.log(`  ${resort.name}: no collected data, keeping existing`);
      return resort;
    }

    try {
      const rawData = JSON.parse(readFileSync(rawFile, 'utf-8'));
      const merged = { ...resort, ...mapToSeedFormat(rawData, resort) };
      console.log(`  ${resort.name}: merged`);
      return merged;
    } catch (err) {
      console.error(`  ${resort.name}: merge error — ${err instanceof Error ? err.message : String(err)}`);
      return resort;
    }
  });

  writeFileSync(SEED_FILE, JSON.stringify(updated, null, 2) + '\n');
  console.log(`\nSeed file updated: ${SEED_FILE}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
