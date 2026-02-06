import Anthropic from '@anthropic-ai/sdk';
import type { ResortDetail, DailyForecast } from '@onlysnow/types';

// ── Client ──────────────────────────────────────────────────────────

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic();
  }
  return _client;
}

// ── System prompt ───────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are OnlySnow's AI analyst. You help skiers interpret weather and conditions data to make better ski decisions.

Voice guidelines:
- Direct and actionable — tell people what to do, not just what's happening
- Snow-focused — snowfall amounts, powder quality, and timing are what matter most
- Quantitative — use specific numbers (inches, percentages, dates)
- Concise — 2-3 short paragraphs maximum
- Conversational but expert — like advice from a friend who's also a meteorologist

Never use corporate language, hedging phrases like "it's important to note", or unnecessary disclaimers. Just give the analysis.`;

// ── Persona tone modifiers ──────────────────────────────────────────

const PERSONA_TONES: Record<string, string> = {
  'powder-hunter': 'The reader is an advanced skier chasing powder. Be technical about snow quality, mention backcountry/sidecountry opportunities, and highlight the best powder stashes.',
  'family-planner': 'The reader is planning a family ski trip. Emphasize safety, visibility, groomed terrain quality, and practical logistics like parking and crowds.',
  'beginner': 'The reader is new to skiing. Use simple language, focus on weather comfort (wind, temperature), and mention learning terrain conditions.',
  'weekend-warrior': 'The reader skis on weekends and needs to maximize limited days. Focus on which specific days are best and crowd avoidance strategies.',
  'destination-traveler': 'The reader is planning a trip from out of town. Emphasize multi-day outlook, travel timing, and whether conditions justify the trip.',
};

// ── Dashboard narrative ─────────────────────────────────────────────

interface DashboardNarrativeInput {
  region: string;
  resorts: Array<{
    name: string;
    snowfall24h: number | null;
    baseDepth: number | null;
    forecast5day: number;
    forecast10day: number;
  }>;
  persona?: string;
}

export async function generateDashboardNarrative(
  input: DashboardNarrativeInput,
): Promise<string> {
  const client = getClient();

  const resortSummary = input.resorts
    .map((r) => `- ${r.name}: 24h ${r.snowfall24h ?? 0}", base ${r.baseDepth ?? 0}", 5-day forecast ${r.forecast5day}", 10-day ${r.forecast10day}"`)
    .join('\n');

  const personaTone = input.persona && PERSONA_TONES[input.persona]
    ? `\n\nTone: ${PERSONA_TONES[input.persona]}`
    : '';

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    system: SYSTEM_PROMPT + personaTone,
    messages: [
      {
        role: 'user',
        content: `Analyze the current ski conditions for the ${input.region} region. What's the story this week? Which resorts should skiers prioritize and why?\n\nResort data:\n${resortSummary}`,
      },
    ],
  });

  const block = message.content[0];
  return block.type === 'text' ? block.text : 'Analysis unavailable.';
}

// ── Resort detail narrative ─────────────────────────────────────────

interface ResortNarrativeInput {
  resort: ResortDetail;
  persona?: string;
}

export async function generateResortNarrative(
  input: ResortNarrativeInput,
): Promise<string> {
  const client = getClient();
  const { resort } = input;

  const forecastSummary = resort.forecast
    .slice(0, 7)
    .map((d: DailyForecast) => `${d.date}: snow ${d.snowfall ?? 0}", high ${d.tempHigh ?? 0}F, wind ${d.windSpeed ?? 0}mph`)
    .join('\n');

  const snowpackInfo = resort.snowpack
    ? `Snowpack: ${resort.snowpack.snowDepth ?? 'N/A'}" depth, SWE ${resort.snowpack.swe ?? 'N/A'}", ${resort.snowpack.sweMedianPct ?? 'N/A'}% of median`
    : 'Snowpack data unavailable';

  const avalancheInfo = resort.avalanche
    ? `Avalanche danger: ${resort.avalanche.dangerRating} (${resort.avalanche.zoneName})`
    : 'Avalanche data unavailable';

  const conditionsInfo = resort.conditions
    ? `Current: ${resort.conditions.snowfall24h ?? 0}" in 24h, ${resort.conditions.baseDepth ?? 0}" base, ${resort.conditions.trailsOpen ?? '?'} trails open, ${resort.conditions.surfaceCondition ?? 'unknown'} surface`
    : 'Current conditions unavailable';

  const personaTone = input.persona && PERSONA_TONES[input.persona]
    ? `\n\nTone: ${PERSONA_TONES[input.persona]}`
    : '';

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    system: SYSTEM_PROMPT + personaTone,
    messages: [
      {
        role: 'user',
        content: `Analyze conditions at ${resort.name} (${resort.region}, ${resort.elevationSummit}' summit). What should a skier know about this mountain right now?\n\n${conditionsInfo}\n${snowpackInfo}\n${avalancheInfo}\n\n7-day forecast:\n${forecastSummary}`,
      },
    ],
  });

  const block = message.content[0];
  return block.type === 'text' ? block.text : 'Analysis unavailable.';
}
