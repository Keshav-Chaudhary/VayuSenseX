import { AtmosphericMetrics, InversionCompatibility } from './types';

/**
 * Assesses meteorological compatibility with nocturnal / winter surface temperature inversions.
 * 
 * SCIENTIFIC CAVEAT:
 * Ground-level meteorological stations cannot directly measure vertical lapse rates.
 * This function detects meteorological conditions that are strongly correlated with
 * surface radiative inversions (shallow mixing layer, calm surface winds, high RH, cold morning temperatures).
 */
export function assessInversionCompatibility(
  metrics: AtmosphericMetrics
): { compatibility: InversionCompatibility; reasons: string[] } {
  const reasons: string[] = [];

  const { boundaryLayerHeight, windSpeedKmH, temperatureC, relativeHumidityPct } = metrics;

  const hasPBLH = boundaryLayerHeight !== undefined && !isNaN(boundaryLayerHeight) && boundaryLayerHeight > 0;
  const hasWind = windSpeedKmH !== undefined && !isNaN(windSpeedKmH) && windSpeedKmH >= 0;

  if (!hasPBLH && !hasWind) {
    return {
      compatibility: 'INSUFFICIENT_DATA',
      reasons: ['Boundary layer height and surface wind data are missing.'],
    };
  }

  let inversionIndicators = 0;

  // 1. Shallow Planetary Boundary Layer Height (PBLH)
  if (hasPBLH && boundaryLayerHeight < 250) {
    inversionIndicators += 2;
    reasons.push(`Shallow planetary boundary layer (${boundaryLayerHeight} m < 250 m threshold).`);
  } else if (hasPBLH && boundaryLayerHeight < 400) {
    inversionIndicators += 1;
    reasons.push(`Compressed mixing layer (${boundaryLayerHeight} m).`);
  }

  // 2. Calm surface winds (suppresses mechanical shear turbulence)
  if (hasWind && windSpeedKmH < 4.0) {
    inversionIndicators += 2;
    reasons.push(`Near-calm surface winds (${windSpeedKmH} km/h) preventing mechanical air mixing.`);
  } else if (hasWind && windSpeedKmH < 8.0) {
    inversionIndicators += 1;
    reasons.push(`Light breeze (${windSpeedKmH} km/h) insufficient for rapid dispersion.`);
  }

  // 3. High humidity (fog / smog aerosol hygroscopic growth)
  if (relativeHumidityPct !== undefined && !isNaN(relativeHumidityPct) && relativeHumidityPct >= 75) {
    inversionIndicators += 1;
    reasons.push(`High relative humidity (${relativeHumidityPct}%) promoting aerosol condensation.`);
  }

  // 4. Cold winter ambient temperature
  if (temperatureC !== undefined && !isNaN(temperatureC) && temperatureC <= 15) {
    inversionIndicators += 1;
    reasons.push(`Low surface ambient temperature (${temperatureC} °C) consistent with radiative cooling.`);
  }

  if (inversionIndicators >= 4) {
    return {
      compatibility: 'STRONG_INVERSION_CONDITIONS',
      reasons,
    };
  } else if (inversionIndicators >= 2) {
    return {
      compatibility: 'MODERATE_INVERSION_RISK',
      reasons,
    };
  }

  return {
    compatibility: 'UNLIKELY_WELL_MIXED',
    reasons: reasons.length > 0 ? reasons : ['Atmospheric layer indicates active convective mixing.'],
  };
}
