import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  checkGeminiHealth,
  executeServerGroundedBriefing,
  executeServerGroundedAnswer,
} from '../../server/aiService';
import { SAMPLE_DELHI_SMOG } from '../../src/domain/sample-data';
import { generateDailyHouseholdPlan } from '../../src/domain/planner';
import { DEFAULT_HOUSEHOLD_PROFILE } from '../../src/domain/household';
import { buildFactRegistry } from '../../src/services/ai/fact-registry';

describe('Server AI Service — Live Gemini, Grounding Rejection & Health Probes', () => {
  const originalKey = process.env.GEMINI_API_KEY;
  const plan = generateDailyHouseholdPlan(DEFAULT_HOUSEHOLD_PROFILE, [], 285);
  const registry = buildFactRegistry(SAMPLE_DELHI_SMOG, plan, 85, 22);
  const validFactId = Object.keys(registry.facts)[0]!;

  beforeEach(() => {
    process.env.GEMINI_API_KEY = 'test-server-api-key';
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    if (originalKey) {
      process.env.GEMINI_API_KEY = originalKey;
    } else {
      delete process.env.GEMINI_API_KEY;
    }
  });

  it('checkGeminiHealth handles MISSING_KEY, READY, CONNECTED, ERROR, and UNREACHABLE', async () => {
    delete process.env.GEMINI_API_KEY;
    expect(await checkGeminiHealth(false)).toMatchObject({ apiKeyConfigured: false, status: 'MISSING_KEY' });

    process.env.GEMINI_API_KEY = 'test-server-api-key';
    expect(await checkGeminiHealth(false)).toMatchObject({ apiKeyConfigured: true, status: 'READY' });

    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response('{}', { status: 200 })));
    expect(await checkGeminiHealth(true)).toMatchObject({ apiKeyConfigured: true, status: 'CONNECTED' });

    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response('err', { status: 503 })));
    expect(await checkGeminiHealth(true)).toMatchObject({ apiKeyConfigured: true, status: 'ERROR', errorCode: 'HTTP_503' });

    vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(new Error('DNS failure')));
    expect(await checkGeminiHealth(true)).toMatchObject({ apiKeyConfigured: true, status: 'UNREACHABLE' });
  });

  it('executeServerGroundedBriefing returns live verified response and handles rejections/errors', async () => {
    const livePayload = {
      candidates: [{
        content: {
          parts: [{
            text: JSON.stringify({
              headline: 'Delhi NCR Severe Smog Briefing',
              summary: 'Avoid early morning outdoor exertion.',
              detailedExplanation: 'Boundary layer inversion traps PM2.5 near surface.',
              actionableGuidance: ['Run HEPA purifier', 'Shift jog to afternoon'],
              supportingFactIds: [validFactId],
              numericalClaims: [],
            }),
          }],
        },
      }],
      usageMetadata: { promptTokenCount: 120, candidatesTokenCount: 60, totalTokenCount: 180 },
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response(JSON.stringify(livePayload), { status: 200 })));
    const live = await executeServerGroundedBriefing(SAMPLE_DELHI_SMOG, plan, registry, 'CPCB');
    expect(live.isDeterministicFallback).toBe(false);
    expect(live.groundingStatus).toBe('VERIFIED');
    expect(live.headline).toBe('Delhi NCR Severe Smog Briefing');
    expect(live.tokenUsage?.totalTokens).toBe(180);

    const hallucinatedPayload = {
      candidates: [{
        content: {
          parts: [{
            text: JSON.stringify({
              headline: 'Fake',
              supportingFactIds: ['FAKE_FACT_404'],
              numericalClaims: [],
            }),
          }],
        },
      }],
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response(JSON.stringify(hallucinatedPayload), { status: 200 })));
    const rejected = await executeServerGroundedBriefing(SAMPLE_DELHI_SMOG, plan, registry, 'CPCB');
    expect(rejected.isDeterministicFallback).toBe(true);
    expect(rejected.fallbackReason).toBe('GROUNDING_REJECTED');

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('bad gateway', { status: 502 })));
    const unavailable = await executeServerGroundedBriefing(SAMPLE_DELHI_SMOG, plan, registry, 'CPCB');
    expect(unavailable.isDeterministicFallback).toBe(true);
    expect(unavailable.fallbackReason).toBe('UPSTREAM_UNAVAILABLE');
  });

  it('executeServerGroundedAnswer passes multi-turn history and falls back on upstream errors', async () => {
    const liveAnswer = {
      candidates: [{
        content: {
          parts: [{
            text: JSON.stringify({
              headline: 'Indoor Workout Recommended',
              summary: 'Keep windows closed today.',
              detailedExplanation: 'Outdoor PM2.5 is elevated.',
              actionableGuidance: ['Exercise indoors'],
              supportingFactIds: [validFactId],
              numericalClaims: [],
            }),
          }],
        },
      }],
    };

    const fetchMock = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify(liveAnswer), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const resp = await executeServerGroundedAnswer(
      'Can I jog outside?',
      SAMPLE_DELHI_SMOG,
      plan,
      registry,
      [{ role: 'user', text: 'Hi' }, { role: 'model', text: 'Hello' }]
    );
    expect(resp.isDeterministicFallback).toBe(false);
    expect(resp.headline).toBe('Indoor Workout Recommended');

    const body = JSON.parse((fetchMock.mock.calls[0]![1] as RequestInit).body as string);
    expect(body.contents.length).toBe(3);

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('timeout')));
    const fallback = await executeServerGroundedAnswer('Can I jog outside?', SAMPLE_DELHI_SMOG, plan, registry, []);
    expect(fallback.isDeterministicFallback).toBe(true);
    expect(fallback.fallbackReason).toBe('UPSTREAM_UNAVAILABLE');
  });
});
