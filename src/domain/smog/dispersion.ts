import { DispersionCategory } from './types';

/**
 * Calculates the atmospheric Ventilation Index (VI) in m²/s.
 * VI = Planetary Boundary Layer Height (m) × Wind Speed (m/s)
 * 
 * Standard IMD / EPA Thresholds:
 * - < 2000 m²/s: Poor ventilation (pollutants trapped near breathing zone)
 * - 2000 - 6000 m²/s: Moderate dispersion
 * - >= 6000 m²/s: Favorable dispersion
 */
export function calculateVentilationIndex(
  boundaryLayerHeightM?: number,
  windSpeedKmH?: number
): { ventilationIndexM2S?: number; category: DispersionCategory } {
  if (
    boundaryLayerHeightM === undefined ||
    boundaryLayerHeightM === null ||
    isNaN(boundaryLayerHeightM) ||
    boundaryLayerHeightM <= 0 ||
    windSpeedKmH === undefined ||
    windSpeedKmH === null ||
    isNaN(windSpeedKmH) ||
    windSpeedKmH < 0
  ) {
    return { category: 'INSUFFICIENT_DATA' };
  }

  const windSpeedMS = windSpeedKmH / 3.6;
  const vi = Math.round(boundaryLayerHeightM * windSpeedMS);

  let category: DispersionCategory = 'FAVORABLE';
  if (vi < 1500) {
    category = 'CRITICAL_STAGNATION';
  } else if (vi < 2500) {
    category = 'POOR';
  } else if (vi < 6000) {
    category = 'MODERATE';
  } else {
    category = 'FAVORABLE';
  }

  return {
    ventilationIndexM2S: vi,
    category,
  };
}
