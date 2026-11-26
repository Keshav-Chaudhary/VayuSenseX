import { describe, it, expect } from 'vitest';
import { evaluateVentilationWindow } from '../../src/domain/indoor/ventilation';
import { assessAtmosphericStagnation } from '../../src/domain/smog/stagnation';

describe('Indoor Ventilation & Atmospheric Stagnation Complete Branch Coverage', () => {
  it('evaluateVentilationWindow handles critical CO2, severe smog, deferred moderate, permissible moderate, and clean air', () => {
    const highCo2 = evaluateVentilationWindow(280, 120, 1650);
    expect(highCo2.shouldVentilate).toBe(true);
    expect(highCo2.recommendedDurationMinutes).toBe(10);

    const severe = evaluateVentilationWindow(220, 180, 700);
    expect(severe.shouldVentilate).toBe(false);
    expect(severe.recommendedDurationMinutes).toBe(0);

    const deferredMod = evaluateVentilationWindow(90, 45);
    expect(deferredMod.shouldVentilate).toBe(false);
    expect(deferredMod.reason).toContain('45');

    const okMod = evaluateVentilationWindow(70, 65);
    expect(okMod.shouldVentilate).toBe(true);
    expect(okMod.recommendedDurationMinutes).toBe(15);

    const clean = evaluateVentilationWindow(28);
    expect(clean.shouldVentilate).toBe(true);
    expect(clean.recommendedDurationMinutes).toBe(60);
  });

  it('assessAtmosphericStagnation evaluates all PBLH, wind speed, thermal inversion, and recommendation thresholds', () => {
    const critical = assessAtmosphericStagnation({
      boundaryLayerHeight: 150,
      windSpeedKmH: 2.0,
      temperatureC: 8,
      relativeHumidityPct: 88,
      pm25UgM3: 290,
      pm10UgM3: 410,
    });
    expect(critical.stagnationScore).toBeGreaterThanOrEqual(75);
    expect(critical.confidence).toBe('HIGH');
    expect(critical.recommendation).toContain('Critical stagnation');

    const moderate = assessAtmosphericStagnation({
      boundaryLayerHeight: 300,
      windSpeedKmH: 5.0,
      temperatureC: 15,
      relativeHumidityPct: 65,
    });
    expect(moderate.stagnationScore).toBeGreaterThanOrEqual(50);

    const mid = assessAtmosphericStagnation({
      boundaryLayerHeight: 550,
      windSpeedKmH: 8.5,
    });
    expect(mid.confidence).toBe('MEDIUM');

    const low = assessAtmosphericStagnation({
      boundaryLayerHeight: 900,
      windSpeedKmH: 13.0,
    });
    expect(low.stagnationScore).toBeLessThan(50);

    const missing = assessAtmosphericStagnation({
      windSpeedKmH: 20,
    });
    expect(missing.dataAvailability.hasPBLH).toBe(false);
    expect(missing.diagnostics.some((d) => d.includes('PBLH missing'))).toBe(true);
  });
});
