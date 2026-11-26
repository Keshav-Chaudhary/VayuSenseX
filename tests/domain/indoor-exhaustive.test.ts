import { describe, it, expect } from 'vitest';
import { solveIndoorMassBalance, evaluateCADRSizing } from '../../src/domain/indoor';

const MASS_BALANCE_CASES = [20, 40, 60, 80, 120].flatMap((roomVolumeM3) =>
  [50, 120, 220, 350].flatMap((outdoorPm25UgM3) =>
    [0, 150, 300, 450, 600].map((purifierCADRM3H) => ({
      roomVolumeM3,
      outdoorPm25UgM3,
      purifierCADRM3H,
    }))
  )
); // 5 * 4 * 5 = 100 cases

const CADR_SIZING_CASES = [25, 45, 60, 85, 110].flatMap((roomVolumeM3) =>
  [50, 150, 250, 400].flatMap((cadr) =>
    [3.0, 4.0, 5.0].map((targetACH) => ({
      roomVolumeM3,
      cadr,
      targetACH,
    }))
  )
); // 5 * 4 * 3 = 60 cases

describe('Indoor Air Mass Balance & CADR Exhaustive Matrix (160 Cases)', () => {
  it.each(MASS_BALANCE_CASES)(
    'solves non-negative mass balance for V=$roomVolumeM3 m³, Cout=$outdoorPm25UgM3 µg/m³, CADR=$purifierCADRM3H m³/h',
    ({ roomVolumeM3, outdoorPm25UgM3, purifierCADRM3H }) => {
      const res = solveIndoorMassBalance(
        {
          roomVolumeM3,
          outdoorPm25UgM3,
          airExchangeRateACH: 0.7,
          penetrationFactor: 0.75,
          depositionRateACH: 0.2,
          purifierCADRM3H,
          filterEfficiency: 0.9997,
          indoorGenerationRateUgH: 0,
          initialIndoorPm25UgM3: outdoorPm25UgM3 * 0.8,
        },
        2.0
      );

      expect(Number.isFinite(res.steadyStateConcentrationUgM3)).toBe(true);
      expect(res.steadyStateConcentrationUgM3).toBeGreaterThanOrEqual(0);
      expect(res.totalRemovalRateACH).toBeGreaterThan(0);
      expect(res.concentrationAfterHoursUgM3).toBeGreaterThanOrEqual(0);
      if (purifierCADRM3H > 0) {
        expect(res.purifierBenefitPercent).toBeGreaterThan(0);
      } else {
        expect(res.purifierBenefitPercent).toBe(0);
      }
    }
  );

  it.each(CADR_SIZING_CASES)(
    'sizes CADR accurately for V=$roomVolumeM3 m³, CADR=$cadr m³/h, target=$targetACH ACH',
    ({ roomVolumeM3, cadr, targetACH }) => {
      const sizing = evaluateCADRSizing(roomVolumeM3, cadr, targetACH);
      expect(sizing.requiredCADRM3H).toBe(Math.round(roomVolumeM3 * targetACH));
      expect(sizing.achAchieved).toBeCloseTo(cadr / roomVolumeM3, 1);
      expect(['INSUFFICIENT', 'ACCEPTABLE', 'OPTIMAL', 'OVERSIZED']).toContain(sizing.assessment);
    }
  );
});
