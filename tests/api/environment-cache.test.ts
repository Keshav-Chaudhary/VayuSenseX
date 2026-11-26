/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EnvironmentalCache } from '../../src/services/environment/cache';
import { generateDeterministicBriefing, generateDeterministicAnswer } from '../../src/services/ai/ai-fallback';
import { buildFactRegistry } from '../../src/services/ai/fact-registry';
import { generateDailyHouseholdPlan } from '../../src/domain/planner';
import { DEFAULT_HOUSEHOLD_PROFILE } from '../../src/domain/household';
import { SAMPLE_DELHI_SMOG, SAMPLE_BENGALURU_MODERATE } from '../../src/domain/sample-data';

describe('EnvironmentalCache & Deterministic AI Fallback Coverage', () => {
  beforeEach(() => {
    EnvironmentalCache.clear();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('caches fresh fetches, coalesces concurrent requests, and falls back to stale data on error', async () => {
    let calls = 0;
    const fetcher = vi.fn(async () => {
      calls++;
      return { pm25: 142 };
    });

    // Concurrent calls coalesce to 1 fetch
    const [r1, r2] = await Promise.all([
      EnvironmentalCache.getOrFetch('city_delhi', fetcher, 5000),
      EnvironmentalCache.getOrFetch('city_delhi', fetcher, 5000),
    ]);
    expect(calls).toBe(1);
    expect(r1.data.pm25).toBe(142);
    expect(r2.isCached).toBe(true);

    // Subsequent call hits memory cache
    const r3 = await EnvironmentalCache.getOrFetch('city_delhi', fetcher, 5000);
    expect(calls).toBe(1);
    expect(r3.isCached).toBe(true);
    expect(r3.isStale).toBe(false);

    // Expired entry in memory falls back to stale if refetch fails
    await EnvironmentalCache.getOrFetch('stale_city', async () => ({ pm25: 99 }), -10);
    const staleRes = await EnvironmentalCache.getOrFetch(
      'stale_city',
      async () => { throw new Error('network error'); },
      5000
    );
    expect(staleRes.isCached).toBe(true);
    expect(staleRes.isStale).toBe(true);
    expect(staleRes.data.pm25).toBe(99);
  });

  it('covers deterministic briefings and Q&A across moderate/severe conditions and topics', () => {
    const severePlan = generateDailyHouseholdPlan(DEFAULT_HOUSEHOLD_PROFILE, [], 285);
    const severeReg = buildFactRegistry(SAMPLE_DELHI_SMOG, severePlan, 85, 22);

    const modPlan = generateDailyHouseholdPlan(DEFAULT_HOUSEHOLD_PROFILE, [], 55);
    const modReg = buildFactRegistry(SAMPLE_BENGALURU_MODERATE, modPlan, 25, 18);

    const modBriefing = generateDeterministicBriefing(SAMPLE_BENGALURU_MODERATE, modPlan, modReg, 'USEPA');
    expect(modBriefing.headline).toContain('USEPA AQI');
    expect(modBriefing.summary).toContain('Moderate');

    const topics = [
      'Should we open windows for fresh air?',
      'Is morning exercise or jogging safe outside?',
      'Do houseplants or a HEPA purifier work better?',
      'Which N95 mask or commute route should I use?',
      'What is the general air quality outlook today?',
    ];

    for (const q of topics) {
      const ans = generateDeterministicAnswer(q, SAMPLE_DELHI_SMOG, severePlan, severeReg);
      expect(ans.isDeterministicFallback).toBe(true);
      expect(ans.groundingStatus).toBe('VERIFIED');
      expect(ans.headline.length).toBeGreaterThan(3);
      expect(ans.actionableGuidance.length).toBeGreaterThan(0);
    }
  });
});
