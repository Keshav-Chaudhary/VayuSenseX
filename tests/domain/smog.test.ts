import { describe, it, expect } from 'vitest';
import { calculateVentilationIndex, assessInversionCompatibility, assessAtmosphericStagnation } from '../../src/domain/smog';

describe('Atmospheric Stagnation & Inversion Diagnostics', () => {
  it('correctly calculates Ventilation Index (PBLH * wind in m/s)', () => {
    // PBLH = 360m, wind = 10 km/h (2.78 m/s) -> VI ~ 1000 m²/s (Critical Stagnation)
    const res = calculateVentilationIndex(360, 10);
    expect(res.category).toBe('CRITICAL_STAGNATION');
    expect(res.ventilationIndexM2S).toBe(1000);
  });

  it('handles missing or non-positive PBLH gracefully without division error', () => {
    expect(calculateVentilationIndex(undefined, 10).category).toBe('INSUFFICIENT_DATA');
    expect(calculateVentilationIndex(0, 10).category).toBe('INSUFFICIENT_DATA');
    expect(calculateVentilationIndex(-200, 10).category).toBe('INSUFFICIENT_DATA');
  });

  it('detects strong inversion-compatible conditions during winter smog', () => {
    const res = assessInversionCompatibility({
      boundaryLayerHeight: 180,
      windSpeedKmH: 2.5,
      relativeHumidityPct: 88,
      temperatureC: 11,
    });

    expect(res.compatibility).toBe('STRONG_INVERSION_CONDITIONS');
    expect(res.reasons.length).toBeGreaterThanOrEqual(3);
  });

  it('computes composite stagnation score with transparent diagnostics', () => {
    const assessment = assessAtmosphericStagnation({
      boundaryLayerHeight: 150,
      windSpeedKmH: 2.0,
      relativeHumidityPct: 90,
      temperatureC: 12,
      pm25UgM3: 290,
    });

    expect(assessment.stagnationScore).toBeGreaterThanOrEqual(75);
    expect(assessment.confidence).toBe('HIGH');
    expect(assessment.recommendation).toContain('Critical stagnation alert');
  });
});
