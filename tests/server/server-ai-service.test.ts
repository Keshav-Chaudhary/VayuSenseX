import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { executeServerGroundedBriefing, executeServerGroundedAnswer } from '../../server/aiService';
import { SAMPLE_DELHI_SMOG } from '../../src/domain/sample-data';
import { generateDailyHouseholdPlan } from '../../src/domain/planner';
import { DEFAULT_HOUSEHOLD_PROFILE } from '../../src/domain/household';
import { buildFactRegistry } from '../../src/services/ai/fact-registry';

describe('Server-Side AI Gateway & Resilient Fallback Engine', () => {
  const originalKey = process.env.GEMINI_API_KEY;
  const plan = generateDailyHouseholdPlan(DEFAULT_HOUSEHOLD_PROFILE, [], 285);
  const registry = buildFactRegistry(SAMPLE_DELHI_SMOG, plan, 85, 22);

  beforeEach(() => {
    delete process.env.GEMINI_API_KEY;
  });

  afterEach(() => {
    if (originalKey) {
      process.env.GEMINI_API_KEY = originalKey;
    }
  });

  it('seamlessly delivers grounded deterministic briefing when no API key is set', async () => {
    const briefing = await executeServerGroundedBriefing(SAMPLE_DELHI_SMOG, plan, registry, 'CPCB');

    expect(briefing).toBeDefined();
    expect(briefing.isDeterministicFallback).toBe(true);
    expect(briefing.groundingStatus).toBe('VERIFIED');
    expect(briefing.headline).toContain('Delhi NCR');
    expect(briefing.supportingFactIds.length).toBeGreaterThanOrEqual(3);
    expect(briefing.actionableGuidance.length).toBeGreaterThanOrEqual(2);
  });

  it('seamlessly delivers grounded deterministic answer for user inquiries without API key', async () => {
    const answer = await executeServerGroundedAnswer(
      'Should Aarav go for morning outdoor football practice?',
      SAMPLE_DELHI_SMOG,
      plan,
      registry
    );

    expect(answer).toBeDefined();
    expect(answer.isDeterministicFallback).toBe(true);
    expect(answer.groundingStatus).toBe('VERIFIED');
    expect(answer.headline.length).toBeGreaterThan(0);
    expect(answer.actionableGuidance.length).toBeGreaterThan(0);
  });

  it('references verified fact IDs in supporting claims', async () => {
    const briefing = await executeServerGroundedBriefing(SAMPLE_DELHI_SMOG, plan, registry, 'CPCB');

    for (const factId of briefing.supportingFactIds) {
      expect(registry.facts[factId]).toBeDefined();
    }
  });

  it('provides actionable guidance addressing peak pollution period', async () => {
    const briefing = await executeServerGroundedBriefing(SAMPLE_DELHI_SMOG, plan, registry, 'CPCB');
    const guidanceText = briefing.actionableGuidance.join(' ');

    expect(guidanceText).toContain(plan.peakPollutionPeriod);
  });

  it('maintains strict sub-second performance under fallback execution', async () => {
    const t0 = performance.now();
    await executeServerGroundedBriefing(SAMPLE_DELHI_SMOG, plan, registry, 'CPCB');
    const t1 = performance.now();

    // Fallback must complete in < 50ms
    expect(t1 - t0).toBeLessThan(50);
  });
});
