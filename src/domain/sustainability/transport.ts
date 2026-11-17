import { TransportComparisonResult, TransportMode } from './types';
import { TRANSPORT_EMISSION_FACTORS } from './emission-factors';

/**
 * Calculates transport emissions and savings when switching modes.
 */
export function compareTransportEmissions(
  distanceKm: number,
  currentMode: TransportMode,
  alternativeMode: TransportMode,
  daysPerWeek: number = 5
): TransportComparisonResult {
  const validDistance = Math.max(0.1, distanceKm);
  const validDays = Math.max(1, Math.min(7, daysPerWeek));

  const currentFactor = TRANSPORT_EMISSION_FACTORS[currentMode];
  const altFactor = TRANSPORT_EMISSION_FACTORS[alternativeMode];

  // Lifecycle emissions per passenger trip (grams CO₂e)
  const currentTripCO2e = Math.round(validDistance * currentFactor.lifecycleGramsCO2ePerKm);
  const altTripCO2e = Math.round(validDistance * altFactor.lifecycleGramsCO2ePerKm);

  const savingsPerTrip = Math.max(0, currentTripCO2e - altTripCO2e);
  const tripsPerMonth = validDays * 4.33 * 2; // round-trip
  const monthlySavingsGrams = Math.round(savingsPerTrip * tripsPerMonth);
  const annualSavingsKg = Number(((monthlySavingsGrams * 12) / 1000).toFixed(1));

  const percentReduction = currentTripCO2e > 0
    ? Math.round((savingsPerTrip / currentTripCO2e) * 100)
    : 0;

  // 1 mature urban tree sequestering ~21.77 kg CO₂/year
  const treesPlanted = Number((annualSavingsKg / 21.77).toFixed(1));

  return {
    currentTripCO2eGrams: currentTripCO2e,
    alternativeTripCO2eGrams: altTripCO2e,
    savingsGramsCO2ePerTrip: savingsPerTrip,
    savingsGramsCO2ePerMonth: monthlySavingsGrams,
    savingsKgCO2ePerYear: annualSavingsKg,
    equivalentTreesPlanted: treesPlanted,
    percentReduction,
    distanceKm: validDistance,
    currentMode,
    alternativeMode,
    boundaryNote:
      'Lifecycle Well-to-Wheel boundary: incorporates tailpipe emissions and upstream electricity grid/fuel generation. Excludes vehicle manufacturing depreciation except active modes.',
  };
}
