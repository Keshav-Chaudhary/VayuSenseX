import { AtmosphericMetrics, StagnationAssessment } from './types';
import { calculateVentilationIndex } from './dispersion';
import { assessInversionCompatibility } from './inversion';

/**
 * Calculates a composite atmospheric stagnation score (0 - 100).
 * 
 * Scoring Weights:
 * - Planetary Boundary Layer Height penalty: up to 40 pts
 * - Wind Speed calmness penalty: up to 35 pts
 * - Inversion compatibility & humidity bonus: up to 25 pts
 */
export function assessAtmosphericStagnation(
  metrics: AtmosphericMetrics
): StagnationAssessment {
  const { boundaryLayerHeight, windSpeedKmH, temperatureC, relativeHumidityPct, pm25UgM3, pm10UgM3 } = metrics;

  const hasPBLH = boundaryLayerHeight !== undefined && !isNaN(boundaryLayerHeight) && boundaryLayerHeight > 0;
  const hasWind = windSpeedKmH !== undefined && !isNaN(windSpeedKmH) && windSpeedKmH >= 0;
  const hasThermal = temperatureC !== undefined && relativeHumidityPct !== undefined;
  const hasPollutants = pm25UgM3 !== undefined || pm10UgM3 !== undefined;

  let confidence: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
  if (hasPBLH && hasWind && hasThermal) confidence = 'HIGH';
  else if (hasPBLH || hasWind) confidence = 'MEDIUM';

  const { ventilationIndexM2S, category: dispersionCategory } = calculateVentilationIndex(
    boundaryLayerHeight,
    windSpeedKmH
  );

  const { compatibility: inversionCompatibility, reasons: inversionReasons } = assessInversionCompatibility(metrics);

  const diagnostics: string[] = [...inversionReasons];

  let score = 0;

  // PBLH Penalty (up to 40)
  if (hasPBLH) {
    if (boundaryLayerHeight < 200) score += 40;
    else if (boundaryLayerHeight < 350) score += 30;
    else if (boundaryLayerHeight < 600) score += 20;
    else if (boundaryLayerHeight < 1000) score += 10;
  } else {
    diagnostics.push('PBLH missing; estimating stagnation without vertical mixing profile.');
  }

  // Wind Speed Penalty (up to 35)
  if (hasWind) {
    if (windSpeedKmH < 3.0) score += 35;
    else if (windSpeedKmH < 6.0) score += 25;
    else if (windSpeedKmH < 10.0) score += 15;
    else if (windSpeedKmH < 15.0) score += 5;
  }

  // Thermal Inversion & Moisture bonus (up to 25)
  if (inversionCompatibility === 'STRONG_INVERSION_CONDITIONS') {
    score += 25;
  } else if (inversionCompatibility === 'MODERATE_INVERSION_RISK') {
    score += 15;
  }

  // Clamp score
  const finalScore = Math.min(100, Math.max(0, score));

  // Determine guidance recommendation
  let recommendation = 'Atmospheric conditions facilitate natural ventilation and particulate dispersion.';
  if (finalScore >= 75) {
    recommendation = 'Critical stagnation alert: Ground-level emissions are trapped. Keep windows sealed, run indoor air cleaners, and postpone non-essential outdoor exertion.';
  } else if (finalScore >= 50) {
    recommendation = 'Moderate stagnation: Particulate dispersal is sluggish. Consider shifting outdoor activities to midday when the boundary layer expands.';
  }

  return {
    stagnationScore: finalScore,
    dispersionCategory,
    inversionCompatibility,
    ventilationIndexM2S,
    diagnostics,
    recommendation,
    confidence,
    dataAvailability: {
      hasPBLH,
      hasWind,
      hasThermal,
      hasPollutants,
    },
    calculatedAt: new Date().toISOString(),
  };
}
