import { describe, it, expect } from 'vitest';
import { calculateInhaledExposure, getBreathingRate } from '../../src/domain/exposure';
import { DemographyGroup, ExertionLevel } from '../../src/domain/exposure/types';

const DEMOGRAPHICS: DemographyGroup[] = ['ADULT', 'CHILD', 'ELDERLY', 'PREGNANT', 'RESPIRATORY_SENSITIVE'];
const EXERTIONS: ExertionLevel[] = ['SLEEP', 'SEDENTARY', 'LIGHT_ACTIVITY', 'MODERATE_EXERCISE', 'HEAVY_EXERCISE'];

const BREATHING_CASES = DEMOGRAPHICS.flatMap((demographic) =>
  EXERTIONS.map((exertion) => ({ demographic, exertion }))
); // 5 * 5 = 25 cases

const DOSE_CASES = DEMOGRAPHICS.flatMap((demographic) =>
  EXERTIONS.flatMap((exertionLevel) =>
    [30, 60, 120, 240, 480].map((durationMinutes) => ({
      demographic,
      exertionLevel,
      durationMinutes,
    }))
  )
); // 5 * 5 * 5 = 125 cases

describe('Exposure & Inhaled Dose Exhaustive Verification (150 Cases)', () => {
  it.each(BREATHING_CASES)(
    'returns strictly positive physiological breathing rate for $demographic at $exertion',
    ({ demographic, exertion }) => {
      const br = getBreathingRate(demographic, exertion);
      expect(br).toBeGreaterThan(0);
      expect(br).toBeLessThan(5);
    }
  );

  it.each(DOSE_CASES)(
    'computes exact D = C * BR * dt for $demographic, $exertionLevel, $durationMinutes min',
    ({ demographic, exertionLevel, durationMinutes }) => {
      const br = getBreathingRate(demographic, exertionLevel);
      const pm25 = 180;
      const summary = calculateInhaledExposure(
        [
          {
            id: 'act-1',
            label: 'Test Activity',
            durationMinutes,
            exertionLevel,
            environment: 'OUTDOOR',
            targetPm25UgM3: pm25,
          },
        ],
        demographic
      );

      const expectedHours = durationMinutes / 60;
      const expectedDose = pm25 * br * expectedHours;

      expect(summary.totalInhaledDoseUg).toBe(Math.round(expectedDose));
      expect(summary.outdoorDoseUg).toBe(Math.round(expectedDose));
      expect(summary.indoorDoseUg).toBe(0);
      expect(summary.totalDurationHours).toBeCloseTo(expectedHours, 2);
      expect(summary.segments).toHaveLength(1);
    }
  );
});
