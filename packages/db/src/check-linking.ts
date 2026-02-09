import { createDb } from './client.js';
import { sql } from 'drizzle-orm';

async function main() {
  const db = createDb(process.env.DATABASE_URL as string);
  const result = await db.execute(sql`
    SELECT cr.name, cr.id, COUNT(r.id)::int as resort_count
    FROM chase_regions cr
    LEFT JOIN resorts r ON r.chase_region_id = cr.id
    GROUP BY cr.id, cr.name
    ORDER BY resort_count DESC
  `);
  for (const row of result) {
    const r = row as Record<string, unknown>;
    console.log(`  ${r.name}: ${r.resort_count} resorts (id=${r.id})`);
  }

  // Check resorts with null chase_region_id
  const unlinked = await db.execute(sql`
    SELECT name, region FROM resorts WHERE chase_region_id IS NULL ORDER BY region, name
  `);
  console.log(`\nUnlinked resorts (null chase_region_id): ${unlinked.length}`);
  for (const row of unlinked) {
    const r = row as Record<string, unknown>;
    console.log(`  ${r.name} (region: ${r.region})`);
  }

  process.exit(0);
}
main();
