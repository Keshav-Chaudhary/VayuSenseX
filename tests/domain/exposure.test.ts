import { describe, it, expect } from 'vitest';
import { calculateInhaledExposure, getBreathingRate } from '../../src/domain/exposure';
import { BASELINE_UNMITIGATED_ROUTINE, OPTIMIZED_VAYUSENSEX_ROUTINE } from '../../src/domain/exposure/activity';

describe('Inhaled Particulate Exposure Dose Engine', () => {
  it('retrieves EPA-grounded volumetric breathing rates by activity and demographic', () => {
    expect(getBreathingRate('ADULT', 'SLEEP')).toBe(0.45);
    expect(getBreathingRate('ADULT', 'HEAVY_EXERCISE')).toBe(3.00);
    expect(getBreathingRate('CHILD', 'SLEEP')).toBe(0.32);
    expect(getBreathingRate('CHILD', 'HEAVY_EXERCISE')).toBe(2.20);
  });

  it('calculates multi-segment cumulative dose across a 24-hr daily schedule', () => {
    const baseline = calculateInhaledExposure(BASELINE_UNMITIGATED_ROUTINE, 'ADULT');
    const optimized = calculateInhaledExposure(OPTIMIZED_VAYUSENSEX_ROUTINE, 'ADULT');

    expect(baseline.totalInhaledDoseUg).toBeGreaterThan(optimized.totalInhaledDoseUg);
    expect(baseline.totalDurationHours).toBe(24);
    expect(optimized.totalDurationHours).toBe(24);

    // Optimized routine should reduce dose by more than 60%
    const reductionPercent = Math.round(
      ((baseline.totalInhaledDoseUg - optimized.totalInhaledDoseUg) / baseline.totalInhaledDoseUg) * 100
    );
    expect(reductionPercent).toBeGreaterThan(60);
  });
});
