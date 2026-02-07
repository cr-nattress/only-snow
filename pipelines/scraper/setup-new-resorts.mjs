import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const c = createClient(
  'https://pczgfwlaywxbvgvvtafo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjemdmd2xheXd4YnZndnZ0YWZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mzc0MDMyNSwiZXhwIjoyMDc5MzE2MzI1fQ.ODY_3sXT4whVH8dCeizpVbi9wfjH3QUKHECfWOSfw7o'
);

const resorts = JSON.parse(readFileSync('/Users/chrisnattress/git/only-snow/supabase/seed/resorts.json', 'utf8'));
const { data: dbResorts } = await c.from('resorts').select('id, slug, snow_report_url').order('id');

let updated = 0;
let configCreated = 0;

for (const r of resorts) {
  if (r.snow_report_url == null) continue;
  const dbr = dbResorts.find(d => d.slug === r.slug);
  if (dbr == null) { console.log('NOT FOUND:', r.slug); continue; }

  if (dbr.snow_report_url == null || dbr.snow_report_url !== r.snow_report_url) {
    const { error } = await c.from('resorts').update({ snow_report_url: r.snow_report_url }).eq('id', dbr.id);
    if (error) console.log('ERR updating', r.slug, error.message);
    else updated++;
  }

  const { data: existing } = await c.from('scraping_config').select('resort_id').eq('resort_id', dbr.id);
  if (existing == null || existing.length === 0) {
    const { error } = await c.from('scraping_config').insert({
      resort_id: dbr.id,
      enabled: true,
      scrape_frequency_hours: 6,
      robots_txt_allowed: true,
      rate_limit_seconds: 2
    });
    if (error) console.log('ERR config', r.slug, error.message);
    else configCreated++;
  }
}

console.log('Updated snow_report_url:', updated);
console.log('Created scraping_config:', configCreated);

const { data: total } = await c.from('resorts').select('id');
const { data: withUrl } = await c.from('resorts').select('id').not('snow_report_url', 'is', null);
const { data: configs } = await c.from('scraping_config').select('resort_id');
console.log('Total resorts:', total.length);
console.log('With snow_report_url:', withUrl.length);
console.log('With scraping_config:', configs.length);
