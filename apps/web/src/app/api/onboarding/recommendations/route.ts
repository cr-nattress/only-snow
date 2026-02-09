import { NextRequest, NextResponse } from 'next/server';
import { withLogging } from '@/lib/api-logger';
import { eq, sql } from 'drizzle-orm';
import { resorts, resortConditions } from '@onlysnow/db';
import type { OnboardingRecommendationResponse } from '@onlysnow/types';
import { CacheKeys, CacheTTL, cache } from '@onlysnow/redis';
import Anthropic from '@anthropic-ai/sdk';
import { getDb } from '@/lib/db';
import { getRedis } from '@/lib/redis';
import { geocode } from '@/lib/geocode';

export const dynamic = 'force-dynamic';

let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_client) _client = new Anthropic();
  return _client;
}

interface RequestBody {
  location: string;
  lat?: number;
  lng?: number;
  passType: string;
  driveRadius: number;
  persona: string;
  experience: string;
  frequency: string;
  groupType: string;
  triggers: string[];
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function passMatches(resortPass: string | null, userPass: string): boolean {
  if (userPass === 'multi' || userPass === 'none') return true;
  if (!resortPass) return userPass === 'none';
  if (resortPass === 'both') return userPass === 'epic' || userPass === 'ikon';
  return resortPass === userPass || resortPass === 'independent';
}

export const POST = withLogging(async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { location, passType, driveRadius, persona, experience, frequency, groupType, triggers } = body;

    if (!location) {
      return NextResponse.json({ error: 'location is required' }, { status: 400 });
    }

    const db = getDb();
    const redis = getRedis();

    // Check recommendations cache (keyed by core filters)
    const recsCacheKey = CacheKeys.onboardingRecs(location, passType, driveRadius);
    const cachedRecs = await cache.get<OnboardingRecommendationResponse>(redis, recsCacheKey);
    if (cachedRecs) {
      return NextResponse.json(cachedRecs);
    }

    // Geocode location (with its own 30-day cache)
    let userLat = body.lat;
    let userLng = body.lng;
    if (!userLat || !userLng) {
      const geo = await geocode(location, redis);
      if (geo) {
        userLat = geo.lat;
        userLng = geo.lng;
      }
    }

    // Query resorts with conditions via Drizzle
    const rows = await db
      .select({
        resort: resorts,
        conditions: resortConditions,
      })
      .from(resorts)
      .leftJoin(resortConditions, eq(resorts.id, resortConditions.resortId));

    // Also try to get snow_reports data (from scraper pipeline, not in Drizzle schema)
    let snowReports: Record<number, { snowfall24h: number | null; baseDepth: number | null; liftsOpen: number | null; runsOpen: number | null; surface: string | null }> = {};
    try {
      const snowRows = await db.execute(sql`
        SELECT DISTINCT ON (resort_id)
          resort_id,
          snowfall_24h_cm,
          depth_base_cm,
          lifts_open,
          runs_open,
          surface_description
        FROM snow_reports
        ORDER BY resort_id, report_date DESC, updated_at DESC
      `);
      for (const row of snowRows) {
        const r = row as Record<string, unknown>;
        const resortId = r.resort_id as number;
        snowReports[resortId] = {
          snowfall24h: r.snowfall_24h_cm != null ? Math.round((r.snowfall_24h_cm as number) / 2.54) : null,
          baseDepth: r.depth_base_cm != null ? Math.round((r.depth_base_cm as number) / 2.54) : null,
          liftsOpen: r.lifts_open as number | null,
          runsOpen: r.runs_open as number | null,
          surface: r.surface_description as string | null,
        };
      }
    } catch {
      // snow_reports table may not exist — that's ok, fall back to resort_conditions
    }

    // Convert drive minutes to approximate miles (1 min ≈ 1 mile on highways)
    const radiusMiles = driveRadius;

    // Filter resorts
    const filtered = rows.filter((row) => {
      // Pass filter
      if (!passMatches(row.resort.passType, passType)) return false;

      // Radius filter (if we have user coordinates)
      if (userLat && userLng) {
        const dist = haversineDistance(userLat, userLng, row.resort.lat, row.resort.lng);
        if (dist > radiusMiles) return false;
      }

      return true;
    });

    if (filtered.length === 0) {
      return NextResponse.json({
        recommendations: [],
        summary: `We couldn't find any resorts matching your criteria near ${location}. Try expanding your drive radius or selecting a different pass.`,
        totalMatching: 0,
      } satisfies OnboardingRecommendationResponse);
    }

    // Build resort data for the LLM
    const resortData = filtered.map((row) => {
      const snow = snowReports[row.resort.id];
      const cond = row.conditions;
      return {
        name: row.resort.name,
        slug: row.resort.slug,
        passType: row.resort.passType ?? 'independent',
        region: row.resort.region,
        elevationSummit: row.resort.elevationSummit,
        terrainAcres: row.resort.terrainAcres,
        totalLifts: row.resort.totalLifts,
        totalTrails: row.resort.totalTrails,
        annualSnowfall: row.resort.annualSnowfall,
        nightSkiing: row.resort.nightSkiing,
        // Prefer snow_reports data, fall back to resort_conditions
        snowfall24h: snow?.snowfall24h ?? cond?.snowfall24h ?? null,
        baseDepth: snow?.baseDepth ?? cond?.baseDepth ?? null,
        liftsOpen: snow?.liftsOpen ?? cond?.liftsOpen ?? null,
        runsOpen: snow?.runsOpen ?? cond?.trailsOpen ?? null,
        surfaceCondition: snow?.surface ?? cond?.surfaceCondition ?? null,
        resortStatus: cond?.resortStatus ?? null,
        distance: userLat && userLng
          ? Math.round(haversineDistance(userLat, userLng, row.resort.lat, row.resort.lng))
          : null,
      };
    });

    // Sort by distance if available
    resortData.sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999));

    // If no API key, return a sensible fallback
    if (!process.env.ANTHROPIC_API_KEY) {
      const top = resortData.slice(0, 6);
      const fallbackResult: OnboardingRecommendationResponse = {
        recommendations: top.map((r) => ({
          name: r.name,
          slug: r.slug,
          passType: r.passType,
          reason: `${r.distance ? r.distance + ' miles away' : r.region}. ${r.baseDepth ? r.baseDepth + '" base depth' : 'Conditions data coming soon'}.`,
          currentConditions: r.surfaceCondition ?? 'Data pending',
        })),
        summary: `We found ${filtered.length} resorts ${passType !== 'none' && passType !== 'multi' ? `on your ${passType.charAt(0).toUpperCase() + passType.slice(1)} pass ` : ''}within ${driveRadius >= 60 ? Math.round(driveRadius / 60) + ' hour' + (driveRadius >= 120 ? 's' : '') : driveRadius + ' minutes'} of ${location}.`,
        totalMatching: filtered.length,
        lat: userLat,
        lng: userLng,
      };
      await cache.set(redis, recsCacheKey, fallbackResult, CacheTTL.ONBOARDING_RECS);
      return NextResponse.json(fallbackResult);
    }

    // Build LLM prompt
    const resortTable = resortData
      .map(
        (r) =>
          `- ${r.name} (${r.passType}, ${r.region}): ${r.distance ? r.distance + 'mi away, ' : ''}summit ${r.elevationSummit}', ${r.terrainAcres ?? '?'} acres, ${r.totalLifts ?? '?'} lifts, ${r.totalTrails ?? '?'} trails, annual snowfall ${r.annualSnowfall ?? '?'}". Current: ${r.snowfall24h ?? '?'}" 24h, ${r.baseDepth ?? '?'}" base, ${r.liftsOpen ?? '?'} lifts open, ${r.runsOpen ?? '?'} runs open, surface: ${r.surfaceCondition ?? 'unknown'}${r.nightSkiing ? ', has night skiing' : ''}`,
      )
      .join('\n');

    const driveLabel = driveRadius >= 60
      ? `${Math.round(driveRadius / 60)} hour${driveRadius >= 120 ? 's' : ''}`
      : `${driveRadius} minutes`;

    const passLabel = passType !== 'none' && passType !== 'multi'
      ? `${passType.charAt(0).toUpperCase() + passType.slice(1)} pass`
      : passType === 'multi' ? 'multiple passes' : 'no pass';

    const userProfile = `Skier profile:
- Location: ${location}
- Pass: ${passLabel}
- Drive radius: ${driveLabel}
- Persona: ${persona}
- Experience: ${experience}
- Frequency: ${frequency}
- Group: ${groupType}
- Decision triggers: ${triggers.join(', ')}`;

    const client = getClient();
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      system: `You are OnlySnow's recommendation engine. Given a skier's profile and available resort data, pick the 4-6 best resorts for this person and explain why in one sentence each.

Respond ONLY with valid JSON matching this exact schema:
{
  "recommendations": [
    {"name": "Resort Name", "slug": "resort-slug", "passType": "epic", "reason": "One sentence why this resort fits them.", "currentConditions": "Brief conditions summary"}
  ],
  "summary": "One sentence overview like 'We found 12 Epic pass resorts within 2 hours of Denver — here are our top picks based on your profile.'",
  "totalMatching": 12
}

Guidelines:
- Pick resorts that genuinely match the skier's persona, experience level, and preferences
- Closer resorts are better for casual/weekend skiers
- For families, prioritize resorts with good beginner/intermediate terrain
- For experts, prioritize terrain variety and snow quality
- For budget-conscious skiers, mention value
- Keep reasons personal and specific to their profile, not generic
- currentConditions should summarize the actual snow data if available
- totalMatching should be ${filtered.length} (total resorts matching their filters)`,
      messages: [
        {
          role: 'user',
          content: `${userProfile}\n\nAvailable resorts (${resortData.length} matching filters):\n${resortTable}`,
        },
      ],
    });

    const block = message.content[0];
    if (block.type !== 'text') {
      throw new Error('Unexpected response format from AI');
    }

    // Parse JSON from LLM response (handle potential markdown wrapping)
    let jsonText = block.text.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
    }

    const result: OnboardingRecommendationResponse = JSON.parse(jsonText);
    result.totalMatching = filtered.length; // Ensure accuracy
    result.lat = userLat; // Include geocoded coordinates in response
    result.lng = userLng;

    // Cache the LLM-generated recommendations
    await cache.set(redis, recsCacheKey, result, CacheTTL.ONBOARDING_RECS);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[onboarding/recommendations] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 },
    );
  }
});
