import { createDb } from './client.js';
import { chaseRegions } from './schema/chase-regions.js';
import { resorts } from './schema/resorts.js';
import { snotelStations } from './schema/snotel.js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SEED_DIR = resolve(__dirname, '../../../supabase/seed');

function loadJson<T>(filename: string): T {
  const path = resolve(SEED_DIR, filename);
  return JSON.parse(readFileSync(path, 'utf-8')) as T;
}

interface ChaseRegionSeed {
  name: string;
  slug: string;
  bestAirport: string | null;
  lat: number;
  lng: number;
}

interface ResortSeed {
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
  nearestAirport: string | null;
  website: string | null;
}

interface SnotelStationSeed {
  stationId: string;
  name: string;
  lat: number;
  lng: number;
  elevation: number;
  state: string;
  nearestResorts: string[];
}

async function seed() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const db = createDb(databaseUrl);

  console.log('Seeding chase regions...');
  const regionsData = loadJson<ChaseRegionSeed[]>('chase-regions.json');
  const insertedRegions = await db
    .insert(chaseRegions)
    .values(
      regionsData.map((r) => ({
        name: r.name,
        bestAirport: r.bestAirport,
        lat: r.lat,
        lng: r.lng,
      })),
    )
    .onConflictDoNothing()
    .returning();
  console.log(`  Inserted ${insertedRegions.length} chase regions`);

  // Build a slug -> region ID map
  const allRegions = await db.select().from(chaseRegions);
  const regionSlugToId = new Map<string, number>();
  for (const region of allRegions) {
    // Derive slug from name: "I-70 Corridor" -> "i70-corridor"
    const slug = region.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    regionSlugToId.set(slug, region.id);
  }

  console.log('Seeding resorts...');
  const resortsData = loadJson<ResortSeed[]>('resorts.json');
  let resortCount = 0;
  for (const r of resortsData) {
    const chaseRegionId = regionSlugToId.get(r.region) ?? null;
    await db
      .insert(resorts)
      .values({
        name: r.name,
        slug: r.slug,
        lat: r.lat,
        lng: r.lng,
        elevationSummit: r.elevationSummit,
        elevationBase: r.elevationBase,
        region: r.region,
        chaseRegionId,
        passType: r.passType,
        totalLifts: r.totalLifts,
        totalTrails: r.totalTrails,
        terrainAcres: r.terrainAcres,
        nearestAirport: r.nearestAirport,
        website: r.website,
      })
      .onConflictDoNothing();
    resortCount++;
  }
  console.log(`  Inserted ${resortCount} resorts`);

  console.log('Seeding SNOTEL stations...');
  const snotelData = loadJson<SnotelStationSeed[]>('snotel-stations.json');
  let snotelCount = 0;
  for (const s of snotelData) {
    // Build resort mappings as JSONB
    const resortMappings = s.nearestResorts.map((slug) => ({ resortSlug: slug }));
    await db
      .insert(snotelStations)
      .values({
        stationId: s.stationId,
        name: s.name,
        lat: s.lat,
        lng: s.lng,
        elevation: s.elevation,
        state: s.state,
        resortMappings,
      })
      .onConflictDoNothing();
    snotelCount++;
  }
  console.log(`  Inserted ${snotelCount} SNOTEL stations`);

  console.log('Seed complete!');
  console.log(`  ${insertedRegions.length} regions, ${resortCount} resorts, ${snotelCount} SNOTEL stations`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
