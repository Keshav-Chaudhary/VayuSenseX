import { DemographyGroup, ExertionLevel } from './types';

/**
 * Standard volumetric inhalation rates (m³/hour).
 * Sourced from US EPA Exposure Factors Handbook (Chapter 6, Physiological Metrics).
 */
export const INHALATION_RATES_M3_PER_HOUR: Record<
  DemographyGroup,
  Record<ExertionLevel, number>
> = {
  ADULT: {
    SLEEP: 0.45,
    SEDENTARY: 0.54,
    LIGHT_ACTIVITY: 1.20,
    MODERATE_EXERCISE: 1.80,
    HEAVY_EXERCISE: 3.00,
  },
  CHILD: {
    SLEEP: 0.32,
    SEDENTARY: 0.40,
    LIGHT_ACTIVITY: 0.95,
    MODERATE_EXERCISE: 1.45,
    HEAVY_EXERCISE: 2.20,
  },
  ELDERLY: {
    SLEEP: 0.40,
    SEDENTARY: 0.50,
    LIGHT_ACTIVITY: 1.10,
    MODERATE_EXERCISE: 1.60,
    HEAVY_EXERCISE: 2.50,
  },
  PREGNANT: {
    SLEEP: 0.50,
    SEDENTARY: 0.62,
    LIGHT_ACTIVITY: 1.35,
    MODERATE_EXERCISE: 2.00,
    HEAVY_EXERCISE: 3.20,
  },
  RESPIRATORY_SENSITIVE: {
    SLEEP: 0.48,
    SEDENTARY: 0.58,
    LIGHT_ACTIVITY: 1.25,
    MODERATE_EXERCISE: 1.90,
    HEAVY_EXERCISE: 3.10,
  },
};

export function getBreathingRate(
  demographic: DemographyGroup,
  exertion: ExertionLevel
): number {
  const group = INHALATION_RATES_M3_PER_HOUR[demographic] || INHALATION_RATES_M3_PER_HOUR.ADULT;
  return group[exertion] ?? 0.54;
}
