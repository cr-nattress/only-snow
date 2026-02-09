import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../.env') });

import { createDb } from '@onlysnow/db';
import { resorts } from '@onlysnow/db';
import { eq } from 'drizzle-orm';
import { discoverWebcamUrl, KNOWN_WEBCAM_URLS } from './webcam-discovery.js';

async function main() {
  const startTime = Date.now();
  console.log('=== Webcam URL Discovery ===\n');

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('ERROR: DATABASE_URL not set.');
    process.exit(1);
  }

  const db = createDb(dbUrl);
  const allResorts = await db.select().from(resorts);

  const needsWebcam = allResorts.filter((r) => !r.webcamUrl);
  const alreadyHas = allResorts.length - needsWebcam.length;

  console.log(`Total resorts: ${allResorts.length}`);
  console.log(`Already have webcam URL: ${alreadyHas}`);
  console.log(`Need discovery: ${needsWebcam.length}\n`);

  let found = 0;
  let knownHits = 0;
  let discoveredHits = 0;
  let notFound = 0;

  for (let i = 0; i < needsWebcam.length; i++) {
    const resort = needsWebcam[i];
    process.stdout.write(`[${i + 1}/${needsWebcam.length}] ${resort.name}...`);

    if (!resort.website) {
      console.log(' no website');
      notFound++;
      continue;
    }

    const webcamUrl = await discoverWebcamUrl(resort.slug, resort.website);

    if (webcamUrl) {
      const isKnown = resort.slug in KNOWN_WEBCAM_URLS;
      await db
        .update(resorts)
        .set({ webcamUrl, updatedAt: new Date() })
        .where(eq(resorts.id, resort.id));

      if (isKnown) {
        console.log(` ${webcamUrl} (known)`);
        knownHits++;
      } else {
        console.log(` ${webcamUrl} (discovered)`);
        discoveredHits++;
      }
      found++;
    } else {
      console.log(' not found');
      notFound++;
    }

    // Rate-limit: 200ms between resorts for discovered ones
    if (!(resort.slug in KNOWN_WEBCAM_URLS) && i < needsWebcam.length - 1) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n=== Summary ===');
  console.log(`Found:      ${found} (${knownHits} known + ${discoveredHits} discovered)`);
  console.log(`Not found:  ${notFound}`);
  console.log(`Duration:   ${durationSec}s`);

  process.exit(0);
}

main().catch((err) => {
  console.error('Discovery failed:', err);
  process.exit(1);
});
