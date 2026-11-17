import { describe, it, expect } from 'vitest';
import { buildFactRegistry } from '../../src/services/ai/fact-registry';
import { validateAIGrounding } from '../../src/services/ai/grounding-validator';
import { generateDeterministicBriefing, generateDeterministicAnswer } from '../../src/services/ai/ai-fallback';
import { SAMPLE_DELHI_SMOG } from '../../src/domain/sample-data';
import { generateDailyHouseholdPlan } from '../../src/domain/planner';
import { DEFAULT_HOUSEHOLD_PROFILE } from '../../src/domain/household';

describe('Fact-ID Grounding and Anti-Hallucination Guard', () => {
  const plan = generateDailyHouseholdPlan(DEFAULT_HOUSEHOLD_PROFILE, [], 285);
  const registry = buildFactRegistry(SAMPLE_DELHI_SMOG, plan, 85, 22);

  it('populates fact registry with verified quantitative metrics and sources', () => {
    expect(registry.facts['fact-outdoor-pm25-current']).toBeDefined();
    expect(registry.facts['fact-cpcb-aqi']).toBeDefined();
    expect(registry.facts['fact-boundary-layer-height']).toBeDefined();
    expect(registry.facts['fact-indoor-pm25-steady']?.value).toBe(22);
  });

  it('accepts compliant AI claims referencing exact Fact IDs and numbers', () => {
    const claims = [
      {
        factId: 'fact-outdoor-pm25-current',
        statedValue: registry.facts['fact-outdoor-pm25-current']!.value,
        unit: 'µg/m³',
      },
    ];

    const res = validateAIGrounding(registry, ['fact-outdoor-pm25-current'], claims);
    expect(res.isValid).toBe(true);
    expect(res.errors.length).toBe(0);
  });

  it('strictly rejects AI responses with hallucinated numbers or fake Fact IDs', () => {
    // 1. Fake Fact ID
    const resFakeId = validateAIGrounding(registry, ['fact-hallucinated-id'], []);
    expect(resFakeId.isValid).toBe(false);
    expect(resFakeId.errors[0]).toContain('Unauthorized Fact ID referenced');

    // 2. Hallucinated number
    const resFakeNum = validateAIGrounding(
      registry,
      ['fact-outdoor-pm25-current'],
      [{ factId: 'fact-outdoor-pm25-current', statedValue: 999.9, unit: 'µg/m³' }]
    );
    expect(resFakeNum.isValid).toBe(false);
    expect(resFakeNum.errors[0]).toContain('Numerical hallucination detected');
  });

  it('generates fully grounded deterministic briefing when fallback is invoked', () => {
    const briefing = generateDeterministicBriefing(SAMPLE_DELHI_SMOG, plan, registry, 'CPCB');
    expect(briefing.isDeterministicFallback).toBe(true);
    expect(briefing.groundingStatus).toBe('VERIFIED');
    expect(briefing.supportingFactIds.length).toBeGreaterThanOrEqual(3);
  });

  it('answers common user inquiries deterministically with facts', () => {
    const answer = generateDeterministicAnswer('Should I open windows today?', SAMPLE_DELHI_SMOG, plan, registry);
    expect(answer.headline).toContain('Ventilation');
    expect(answer.actionableGuidance.length).toBeGreaterThan(0);
  });
});
