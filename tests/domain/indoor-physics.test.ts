import { describe, it, expect } from 'vitest';
import { solveIndoorMassBalance, evaluateCADRSizing } from '../../src/domain/indoor';

describe('Indoor Air Mass Balance Physics & CADR Sizing', () => {
  it('calculates steady-state indoor PM2.5 under natural infiltration without filtration', () => {
    // V = 60 m3, ACH = 0.8 /hr, P = 0.7, k = 0.2 /hr, C_out = 200 ug/m3, CADR = 0
    const result = solveIndoorMassBalance({
      roomVolumeM3: 60,
      outdoorPm25UgM3: 200,
      airExchangeRateACH: 0.8,
      penetrationFactor: 0.7,
      depositionRateACH: 0.2,
      purifierCADRM3H: 0,
      filterEfficiency: 0.9997,
      indoorGenerationRateUgH: 0,
      initialIndoorPm25UgM3: 200,
    });

    // Steady-state formula: C_in = (P * ACH * C_out) / (ACH + k)
    // C_in = (0.7 * 0.8 * 200) / (0.8 + 0.2) = 112 / 1.0 = 112 ug/m3
    expect(result.steadyStateConcentrationUgM3).toBeCloseTo(112, 1);
    expect(result.totalRemovalRateACH).toBe(1.0);
  });

  it('demonstrates mechanical HEPA filtration dramatically lowers indoor steady-state concentration', () => {
    // Add HEPA purifier with CADR = 300 m3/hr into 60 m3 room (ACH_purifier = 300/60 = 5.0 /hr)
    const result = solveIndoorMassBalance({
      roomVolumeM3: 60,
      outdoorPm25UgM3: 200,
      airExchangeRateACH: 0.8,
      penetrationFactor: 0.7,
      depositionRateACH: 0.2,
      purifierCADRM3H: 300,
      filterEfficiency: 0.9997,
      indoorGenerationRateUgH: 0,
      initialIndoorPm25UgM3: 150,
    }, 3.0);

    // Effective clearance = ACH + k + (CADR/V) = 0.8 + 0.2 + 5.0 = 6.0 /hr
    // Steady state = 112 / 6.0 = ~18.67 ug/m3
    expect(result.steadyStateConcentrationUgM3).toBeLessThan(25);
    expect(result.purifierBenefitPercent).toBeGreaterThan(80);
  });

  it('accurately estimates decay time to achieve safe indoor target', () => {
    const result = solveIndoorMassBalance({
      roomVolumeM3: 60,
      outdoorPm25UgM3: 150,
      airExchangeRateACH: 0.5,
      penetrationFactor: 0.7,
      depositionRateACH: 0.2,
      purifierCADRM3H: 350,
      filterEfficiency: 0.9997,
      indoorGenerationRateUgH: 0,
      initialIndoorPm25UgM3: 120,
    }, 1.0);

    expect(result.timeTo90PercentCleanupMinutes).toBeDefined();
    expect(result.concentrationAfterHoursUgM3).toBeLessThan(result.initialConcentrationUgM3);
  });

  it('sizes recommended CADR based on room dimensions and ANSI/AHAM 5.0 ACH rule', () => {
    const sizing = evaluateCADRSizing(50, 250, 5.0);
    expect(sizing.requiredCADRM3H).toBe(250);
    expect(sizing.achAchieved).toBe(5.0);
    expect(sizing.assessment).toBe('OPTIMAL');
  });
});
