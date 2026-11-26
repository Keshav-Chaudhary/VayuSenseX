import { describe, it, expect } from 'vitest';
import { 
  calculateVentilationIndex, 
  assessInversionCompatibility, 
  assessAtmosphericStagnation 
} from '../../src/domain/smog';

describe('Atmospheric Micrometeorology & Smog Stagnation Invariant Tests', () => {
  it('calculates ventilation index Vc = U * Hm and classifies dispersion capacity', () => {
    // Critical dispersion: Wind speed 5.4 km/h (1.5 m/s), Boundary layer height 180 m -> VI = 180 * 1.5 = 270 m2/s
    const critical = calculateVentilationIndex(180, 5.4);
    expect(critical.ventilationIndexM2S).toBeCloseTo(270, 0);
    expect(critical.category).toBe('CRITICAL_STAGNATION');

    // Favorable dispersion: Wind speed 21.6 km/h (6.0 m/s), Boundary layer height 1200 m -> VI = 1200 * 6.0 = 7200 m2/s
    const good = calculateVentilationIndex(1200, 21.6);
    expect(good.ventilationIndexM2S).toBeCloseTo(7200, 0);
    expect(good.category).toBe('FAVORABLE');
  });

  it('detects nocturnal thermal inversion conditions under cold winter calm', () => {
    // Shallow boundary layer (160 m < 250 m), calm wind (2.5 km/h < 4 km/h), high humidity
    const inversion = assessInversionCompatibility({
      boundaryLayerHeight: 160,
      windSpeedKmH: 2.5,
      temperatureC: 9,
      relativeHumidityPct: 92,
    });

    expect(inversion.compatibility).toBe('STRONG_INVERSION_CONDITIONS');
    expect(inversion.reasons.some(r => r.includes('Shallow planetary boundary layer'))).toBe(true);
    expect(inversion.reasons.some(r => r.includes('Near-calm surface winds'))).toBe(true);
  });

  it('diagnoses midday thermal breaking of inversion caps', () => {
    // Midday solar convection: boundary layer expands to 1100 m, wind speed 12 km/h, low humidity
    const afternoon = assessInversionCompatibility({
      boundaryLayerHeight: 1100,
      windSpeedKmH: 12.0,
      temperatureC: 22,
      relativeHumidityPct: 45,
    });

    expect(afternoon.compatibility).toBe('UNLIKELY_WELL_MIXED');
  });

  it('evaluates composite stagnation risk score', () => {
    const stagnation = assessAtmosphericStagnation({
      boundaryLayerHeight: 150,
      windSpeedKmH: 2.0,
      temperatureC: 10,
      relativeHumidityPct: 88,
      pm25UgM3: 280,
    });

    expect(stagnation.stagnationScore).toBeGreaterThanOrEqual(70);
    expect(stagnation.dispersionCategory).toBe('CRITICAL_STAGNATION');
    expect(stagnation.confidence).toBe('HIGH');
  });
});
