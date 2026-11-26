import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  getGeminiModel,
  fetchGeminiWithRetry,
  invokeGroundedGemini,
} from '../../server/gemini-http';
import {
  fetchGatewayAIHealth,
  getGroundedDailyBriefing,
  askGroundedAssistant,
} from '../../src/services/ai/gemini-client';
import { buildFactRegistry } from '../../src/services/ai/fact-registry';
import { generateDailyHouseholdPlan } from '../../src/domain/planner/schedule-optimizer';
import { SAMPLE_DELHI_SMOG } from '../../src/domain/sample-data';
import { DEFAULT_HOUSEHOLD_PROFILE } from '../../src/domain/household/household-store';

describe('Server Gemini HTTP & Client Gateway Integration', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    delete process.env.GEMINI_MODEL;
  });

  it('resolves default and overridden Gemini model names', () => {
    delete process.env.GEMINI_MODEL;
    expect(getGeminiModel()).toBe('gemini-2.5-flash');
    process.env.GEMINI_MODEL = 'gemini-2.5-flash-lite';
    expect(getGeminiModel()).toBe('gemini-2.5-flash-lite');
  });

  it('passes API key via x-goog-api-key header and retries once on 429', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('rate limited', { status: 429 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const res = await fetchGeminiWithRetry('secret-key-123', 'gemini-2.5-flash', { test: true }, 2000, 1);
    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).not.toContain('secret-key-123');
    expect((init.headers as Record<string, string>)['x-goog-api-key']).toBe('secret-key-123');
  });

  it('validates grounded Gemini payloads and rejects hallucinated fact IDs', async () => {
    const plan = generateDailyHouseholdPlan(DEFAULT_HOUSEHOLD_PROFILE, [], 280);
    const registry = buildFactRegistry(SAMPLE_DELHI_SMOG, plan);
    const validFactId = Object.keys(registry.facts)[0];

    const validPayload = {
      candidates: [{
        content: {
          parts: [{
            text: JSON.stringify({
              headline: 'Stay indoors during peak smog',
              summary: 'PM2.5 is elevated',
              supportingFactIds: [validFactId],
              numericalClaims: [],
            }),
          }],
        },
      }],
      usageMetadata: { promptTokenCount: 100, candidatesTokenCount: 50, totalTokenCount: 150 },
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response(JSON.stringify(validPayload), { status: 200 })));
    const result = await invokeGroundedGemini('key', [{ role: 'user', parts: [{ text: 'hi' }] }], registry);
    expect(result.parsed.headline).toBe('Stay indoors during peak smog');
    expect(result.tokenUsage?.totalTokens).toBe(150);

    const invalidPayload = {
      candidates: [{
        content: {
          parts: [{
            text: JSON.stringify({
              headline: 'Hallucinated',
              supportingFactIds: ['NON_EXISTENT_FACT_999'],
              numericalClaims: [],
            }),
          }],
        },
      }],
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response(JSON.stringify(invalidPayload), { status: 200 })));
    await expect(
      invokeGroundedGemini('key', [{ role: 'user', parts: [{ text: 'hi' }] }], registry)
    ).rejects.toThrow(/GROUNDING_REJECTED/);
  });

  it('handles gateway health, live responses, and offline fallbacks cleanly', async () => {
    const plan = generateDailyHouseholdPlan(DEFAULT_HOUSEHOLD_PROFILE, [], 280);
    const registry = buildFactRegistry(SAMPLE_DELHI_SMOG, plan);

    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(
      new Response(JSON.stringify({ gemini: { apiKeyConfigured: true, model: 'gemini-2.5-flash', status: 'READY' } }), { status: 200 })
    ));
    const health = await fetchGatewayAIHealth(false);
    expect(health).toEqual({
      backendReachable: true,
      apiKeyConfigured: true,
      model: 'gemini-2.5-flash',
      status: 'READY',
    });

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));
    const briefing = await getGroundedDailyBriefing(SAMPLE_DELHI_SMOG, plan, registry, 'CPCB');
    expect(briefing.isDeterministicFallback).toBe(true);
    expect(briefing.fallbackReason).toBe('GATEWAY_OFFLINE');

    const answer = await askGroundedAssistant('Should I open windows?', SAMPLE_DELHI_SMOG, plan, registry, []);
    expect(answer.isDeterministicFallback).toBe(true);
    expect(answer.headline.length).toBeGreaterThan(5);
  });
});
