/**
 * Ventilation timing decision engine.
 * Determines whether opening windows is beneficial or harmful based on outdoor PM2.5 thresholds.
 */

export interface VentilationAdvice {
  shouldVentilate: boolean;
  recommendedDurationMinutes: number;
  reason: string;
  caution: string;
}

export function evaluateVentilationWindow(
  currentOutdoorPm25: number,
  forecastLowestPm25?: number,
  indoorCo2Ppm?: number
): VentilationAdvice {
  // If indoor CO2 is critically elevated (> 1400 ppm), brief flush is mandatory even in poor air
  if (indoorCo2Ppm !== undefined && indoorCo2Ppm > 1400) {
    return {
      shouldVentilate: true,
      recommendedDurationMinutes: 10,
      reason: `Indoor CO₂ is dangerously elevated (${indoorCo2Ppm} ppm). A brief 10-minute cross-ventilation purge is necessary.`,
      caution: 'Run HEPA purifiers on maximum turbo speed immediately upon closing windows to scrub introduced outdoor particulates.',
    };
  }

  // Under severe winter smog (> 120 µg/m³ PM2.5)
  if (currentOutdoorPm25 >= 120) {
    return {
      shouldVentilate: false,
      recommendedDurationMinutes: 0,
      reason: `Outdoor PM2.5 is severe (${currentOutdoorPm25} µg/m³). Opening windows will rapidly contaminate indoor air.`,
      caution: 'Keep all exterior windows and doors sealed. Rely on internal mechanical recirculation.',
    };
  }

  // Under moderate pollution (45 - 120 µg/m³ PM2.5)
  if (currentOutdoorPm25 >= 45) {
    if (forecastLowestPm25 !== undefined && forecastLowestPm25 < currentOutdoorPm25 * 0.75) {
      return {
        shouldVentilate: false,
        recommendedDurationMinutes: 0,
        reason: `Current PM2.5 is elevated (${currentOutdoorPm25} µg/m³). A cleaner window of ${forecastLowestPm25} µg/m³ is forecast later today.`,
        caution: 'Defer natural ventilation until the forecast cleanest window.',
      };
    }
    return {
      shouldVentilate: true,
      recommendedDurationMinutes: 15,
      reason: `Moderate outdoor air (${currentOutdoorPm25} µg/m³). Brief 15-minute flush permissible during midday peak mixing.`,
      caution: 'Seal windows before evening inversion layer sets in.',
    };
  }

  // Under clean conditions (< 45 µg/m³ PM2.5)
  return {
    shouldVentilate: true,
    recommendedDurationMinutes: 60,
    reason: `Outdoor air is relatively clean (${currentOutdoorPm25} µg/m³). Ideal window for extensive natural room ventilation.`,
    caution: 'Monitor outdoor trends and close windows if wind drops or smoke plumes appear.',
  };
}
