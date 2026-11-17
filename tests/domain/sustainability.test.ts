import { describe, it, expect } from 'vitest';
import { compareTransportEmissions, calculateHouseholdEmissions } from '../../src/domain/sustainability';

describe('Sustainability & Transportation Emissions Engine', () => {
  it('correctly models emissions savings when switching from petrol car to electric metro', () => {
    // 15 km commute, 5 days a week
    const res = compareTransportEmissions(15, 'PETROL_CAR', 'METRO_RAIL', 5);

    expect(res.currentTripCO2eGrams).toBe(15 * 172); // 2580 g
    expect(res.alternativeTripCO2eGrams).toBe(15 * 22); // 330 g
    expect(res.savingsGramsCO2ePerTrip).toBe(2250);
    expect(res.percentReduction).toBeGreaterThan(80);
    expect(res.savingsKgCO2ePerYear).toBeGreaterThan(200);
  });

  it('calculates household utility emissions using CEA and IPCC emission factors', () => {
    // 250 kWh electricity, 14.2 kg LPG (1 cylinder)
    const res = calculateHouseholdEmissions({
      monthlyElectricityKWh: 250,
      monthlyLpgKg: 14.2,
    });

    expect(res.electricityCO2eKg).toBeCloseTo(250 * 0.716, 1);
    expect(res.lpgCO2eKg).toBeCloseTo(14.2 * 2.98, 1);
    expect(res.totalMonthlyCO2eKg).toBeGreaterThan(200);
  });
});
