import { ActivityInterval, DemographyGroup, ExposureSummary, InhaledDoseSegment } from './types';
import { getBreathingRate } from './breathing-rates';

/**
 * Calculates cumulative inhaled particulate dose:
 * D = Σ (C_t * BR_t * Δt)
 * 
 * SCIENTIFIC CAVEAT:
 * Output is an engineering estimate of inhaled particulate mass (µg) based on assumed
 * volumetric ventilation rates. It represents exposure intake, NOT internal deposition fraction,
 * toxicological absorption, or individual clinical risk.
 */
export function calculateInhaledExposure(
  intervals: ActivityInterval[],
  demographic: DemographyGroup = 'ADULT',
  defaultOutdoorPm25: number = 150,
  defaultIndoorPm25: number = 45,
  defaultTransitPm25: number = 180
): ExposureSummary {
  const segments: InhaledDoseSegment[] = [];

  let totalDose = 0;
  let totalVolume = 0;
  let totalHours = 0;
  let indoorDose = 0;
  let outdoorDose = 0;
  let transitDose = 0;

  for (const interval of intervals) {
    const durationHours = Math.max(0, interval.durationMinutes / 60);
    const breathingRate = getBreathingRate(demographic, interval.exertionLevel);

    // Determine ambient concentration for this microenvironment
    let concentration = interval.targetPm25UgM3;
    if (concentration === undefined || isNaN(concentration) || concentration < 0) {
      if (interval.environment === 'INDOOR') concentration = defaultIndoorPm25;
      else if (interval.environment === 'OUTDOOR') concentration = defaultOutdoorPm25;
      else concentration = defaultTransitPm25;
    }

    const volumeAir = breathingRate * durationHours;
    const dose = concentration * volumeAir; // µg

    segments.push({
      activityId: interval.id,
      activityLabel: interval.label,
      durationHours: Number(durationHours.toFixed(2)),
      exertionLevel: interval.exertionLevel,
      breathingRateM3H: breathingRate,
      environment: interval.environment,
      concentrationUgM3: Number(concentration.toFixed(1)),
      inhaledDoseUg: Number(dose.toFixed(1)),
      volumeAirInhaledM3: Number(volumeAir.toFixed(3)),
    });

    totalDose += dose;
    totalVolume += volumeAir;
    totalHours += durationHours;

    if (interval.environment === 'INDOOR') indoorDose += dose;
    else if (interval.environment === 'OUTDOOR') outdoorDose += dose;
    else transitDose += dose;
  }

  const avgEffectiveConcentration = totalVolume > 0 ? totalDose / totalVolume : 0;

  return {
    demographicGroup: demographic,
    totalDurationHours: Number(totalHours.toFixed(2)),
    totalInhaledDoseUg: Math.round(totalDose),
    totalVolumeInhaledM3: Number(totalVolume.toFixed(2)),
    averageEffectiveConcentrationUgM3: Number(avgEffectiveConcentration.toFixed(1)),
    indoorDoseUg: Math.round(indoorDose),
    outdoorDoseUg: Math.round(outdoorDose),
    transitDoseUg: Math.round(transitDose),
    segments,
    scientificDisclaimer:
      'Modelled inhaled particulate mass (µg) based on US EPA breathing-rate assumptions. This metric assists in comparing daily routine alternatives and is not a medical diagnosis or clinical risk assessment.',
    calculatedAt: new Date().toISOString(),
  };
}
