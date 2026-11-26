import { describe, it, expect } from 'vitest';
import { calculateVentilationIndex } from '../../src/domain/smog';
import { compareTransportEmissions } from '../../src/domain/sustainability';
import { TransportMode } from '../../src/domain/sustainability/types';

const DISPERSION_CASES = [100, 200, 350, 500, 800, 1200, 1800, 2500, 3000].flatMap((boundaryLayerHeightM) =>
  [0, 2, 4, 6, 8, 10, 14, 18, 22, 28].map((windSpeedKmH) => ({
    boundaryLayerHeightM,
    windSpeedKmH,
  }))
); // 9 * 10 = 90 cases

const MODES: TransportMode[] = ['PETROL_CAR', 'DIESEL_CAR', 'METRO_RAIL', 'EV_CAR', 'CYCLING', 'WALKING', 'BUS'];
const TRANSPORT_CASES = [3, 8, 15, 25, 40].flatMap((distanceKm) =>
  ['PETROL_CAR', 'DIESEL_CAR'].flatMap((currentMode) =>
    MODES.map((alternativeMode) => ({
      distanceKm,
      currentMode: currentMode as TransportMode,
      alternativeMode,
    }))
  )
); // 5 * 2 * 7 = 70 cases

describe('Smog Dispersion & Transport WTW Exhaustive Verification (160 Cases)', () => {
  it.each(DISPERSION_CASES)(
    'computes Vc = U * Hm for Hm=$boundaryLayerHeightM m, U=$windSpeedKmH km/h',
    ({ boundaryLayerHeightM, windSpeedKmH }) => {
      const res = calculateVentilationIndex(boundaryLayerHeightM, windSpeedKmH);
      const expectedVi = Math.round(boundaryLayerHeightM * (windSpeedKmH / 3.6));
      expect(res.ventilationIndexM2S).toBe(expectedVi);

      if (expectedVi < 1500) expect(res.category).toBe('CRITICAL_STAGNATION');
      else if (expectedVi < 2500) expect(res.category).toBe('POOR');
      else if (expectedVi < 6000) expect(res.category).toBe('MODERATE');
      else expect(res.category).toBe('FAVORABLE');
    }
  );

  it.each(TRANSPORT_CASES)(
    'computes WTW CO2e savings for $distanceKm km: $currentMode -> $alternativeMode',
    ({ distanceKm, currentMode, alternativeMode }) => {
      const res = compareTransportEmissions(distanceKm, currentMode, alternativeMode, 5);
      expect(res.currentTripCO2eGrams).toBeGreaterThan(0);
      expect(res.alternativeTripCO2eGrams).toBeGreaterThanOrEqual(0);
      expect(res.savingsGramsCO2ePerTrip).toBeGreaterThanOrEqual(0);
      expect(res.savingsKgCO2ePerYear).toBeGreaterThanOrEqual(0);
      expect(res.equivalentTreesPlanted).toBeGreaterThanOrEqual(0);
      expect(res.percentReduction).toBeGreaterThanOrEqual(0);
      expect(res.percentReduction).toBeLessThanOrEqual(100);
    }
  );
});
