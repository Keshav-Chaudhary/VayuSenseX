import { describe, it, expect, vi, afterEach } from 'vitest';
import { searchLocations, PRESET_URBAN_LOCATIONS } from '../../src/services/environment/geocoding';
import {
  fetchGatewayAIHealth,
  getGroundedDailyBriefing,
  askGroundedAssistant,
} from '../../src/services/ai/gemini-client';
import { SAMPLE_DELHI_SMOG } from '../../src/domain/sample-data';
import { generateDailyHouseholdPlan } from '../../src/domain/planner';
import { DEFAULT_HOUSEHOLD_PROFILE } from '../../src/domain/household';
import { buildFactRegistry } from '../../src/services/ai/fact-registry';

describe('Nominatim Geocoding & Client AI Gateway Live Paths', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('searchLocations covers short queries, preset matches, live Nominatim parsing, and error fallbacks', async () => {
    const empty = await searchLocations(' ');
    expect(empty.length).toBe(4);
    expect(PRESET_URBAN_LOCATIONS.length).toBeGreaterThanOrEqual(4);

    const presetHits = await searchLocations('India');
    expect(presetHits.every((p) => p.country === 'India')).toBe(true);

    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(
      new Response(JSON.stringify([
        {
          osm_id: 101,
          name: 'Pune',
          display_name: 'Pune, Maharashtra, India',
          lat: '18.5204',
          lon: '73.8567',
          address: { country: 'India', state: 'Maharashtra' },
        },
      ]), { status: 200 })
    ));
    const liveResults = await searchLocations('Pune');
    expect(liveResults.some((r) => r.name === 'Pune')).toBe(true);

    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response('err', { status: 500 })));
    const httpErrFallback = await searchLocations('Unknownville');
    expect(httpErrFallback.length).toBeGreaterThan(0);

    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response('{"bad":true}', { status: 200 })));
    const schemaErrFallback = await searchLocations('Unknownville');
    expect(schemaErrFallback.length).toBeGreaterThan(0);

    vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(new Error('offline')));
    const offlineFallback = await searchLocations('Delhi');
    expect(offlineFallback.length).toBeGreaterThanOrEqual(1);
  });

  it('gemini-client handles live HTTP 200 JSON responses and non-OK HTTP errors cleanly', async () => {
    const plan = generateDailyHouseholdPlan(DEFAULT_HOUSEHOLD_PROFILE, [], 285);
    const registry = buildFactRegistry(SAMPLE_DELHI_SMOG, plan, 85, 22);

    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response('fail', { status: 503 })));
    const errHealth = await fetchGatewayAIHealth(true);
    expect(errHealth.status).toBe('ERROR');

    const liveResp = {
      headline: 'Live Gateway Briefing',
      summary: 'Stay protected.',
      detailedExplanation: 'Details.',
      actionableGuidance: ['Run HEPA'],
      supportingFactIds: Object.keys(registry.facts).slice(0, 2),
      numericalClaims: [],
      isDeterministicFallback: false,
      groundingStatus: 'VERIFIED',
      generatedAt: new Date().toISOString(),
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response(JSON.stringify(liveResp), { status: 200 })));
    const liveBriefing = await getGroundedDailyBriefing(SAMPLE_DELHI_SMOG, plan, registry, 'CPCB');
    expect(liveBriefing.headline).toBe('Live Gateway Briefing');

    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response(JSON.stringify(liveResp), { status: 200 })));
    const liveAnswer = await askGroundedAssistant('Can I jog?', SAMPLE_DELHI_SMOG, plan, registry, []);
    expect(liveAnswer.headline).toBe('Live Gateway Briefing');
  });
});
