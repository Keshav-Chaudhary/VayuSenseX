import { describe, it, expect } from 'vitest';
import { solveIndoorMassBalance, calculateRoomVolume, evaluateCADRSizing, estimateDIYBoxFanCADR, evaluateVentilationWindow } from '../../src/domain/indoor';

describe('Indoor Mass-Balance and CADR Engine', () => {
  it('accurately calculates room volume from length, width, and height', () => {
    expect(calculateRoomVolume({ lengthM: 5, widthM: 4, heightM: 3 })).toBe(60);
    expect(calculateRoomVolume({ lengthM: -5, widthM: 4, heightM: 3 })).toBe(0);
  });

  it('correctly solves steady-state indoor concentration with active HEPA filtration', () => {
    // 50 m³ room, outdoor PM2.5 = 200 µg/m³, CADR = 250 m³/h, efficiency = 0.99
    const res = solveIndoorMassBalance({
      roomVolumeM3: 50,
      outdoorPm25UgM3: 200,
      penetrationFactor: 0.7,
      airExchangeRateACH: 0.3,
      depositionRateACH: 0.2,
      purifierCADRM3H: 250,
      filterEfficiency: 0.99,
      indoorGenerationRateUgH: 0,
      initialIndoorPm25UgM3: 150,
    }, 2.0);

    expect(res.modelValidity.isValid).toBe(true);
    expect(res.steadyStateConcentrationUgM3).toBeLessThan(20);
    expect(res.purifierBenefitPercent).toBeGreaterThan(80);
    expect(res.timeTo90PercentCleanupMinutes).toBeLessThan(60);
  });

  it('evaluates CADR sizing sufficiency correctly', () => {
    // 50 m³ room, target ACH 5 -> required CADR = 250 m³/h
    const sizing = evaluateCADRSizing(50, 300, 5);
    expect(sizing.requiredCADRM3H).toBe(250);
    expect(sizing.achAchieved).toBe(6);
    expect(sizing.assessment).toBe('OPTIMAL');

    const undersized = evaluateCADRSizing(50, 100, 5);
    expect(undersized.assessment).toBe('INSUFFICIENT');
  });

  it('estimates DIY Corsi-Rosenthal box fan CADR and cost', () => {
    const diy = estimateDIYBoxFanCADR(800, 'MERV13');
    expect(diy.estimatedCADRM3H).toBe(680);
    expect(diy.estimatedCostUSD).toBe(45);
  });

  it('recommends keeping windows sealed during severe outdoor smog', () => {
    const advice = evaluateVentilationWindow(250, 180);
    expect(advice.shouldVentilate).toBe(false);
    expect(advice.reason).toContain('Outdoor PM2.5 is severe');
  });
});
