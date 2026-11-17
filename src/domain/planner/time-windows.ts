import { HourlyForecastPoint } from '../../services/environment/types';

export interface EvaluatedTimeWindow {
  hourIndex: number;
  hourLabel: string;
  pm25: number;
  cpcbAqi: number;
  isPeakSmog: boolean;
  isRelativelyCleaner: boolean;
  suitabilityScore: number; // 0 (Severe risk) to 100 (Optimal for exercise)
  recommendation: string;
}

/**
 * Evaluates each hour of the day for outdoor activity suitability.
 */
export function evaluateHourlyTimeWindows(
  forecast: HourlyForecastPoint[]
): {
  windows: EvaluatedTimeWindow[];
  cleanestWindow?: EvaluatedTimeWindow;
  worstPeakWindow?: EvaluatedTimeWindow;
} {
  if (!forecast || forecast.length === 0) {
    return { windows: [] };
  }

  const windows: EvaluatedTimeWindow[] = [];
  let minPm25 = Infinity;
  let maxPm25 = -Infinity;
  let cleanest: EvaluatedTimeWindow | undefined;
  let worst: EvaluatedTimeWindow | undefined;

  // Find min/max for normalization
  for (const pt of forecast) {
    if (pt.pm25 > 0) {
      if (pt.pm25 < minPm25) minPm25 = pt.pm25;
      if (pt.pm25 > maxPm25) maxPm25 = pt.pm25;
    }
  }

  const spread = Math.max(1, maxPm25 - minPm25);

  forecast.forEach((pt, idx) => {
    // Relative suitability score: 100 = cleanest hour of day, scaled down for high absolute PM2.5
    const relativePosition = (maxPm25 - pt.pm25) / spread; // 0 to 1
    const absolutePenalty = Math.min(60, (pt.pm25 / 300) * 60);
    const score = Math.max(0, Math.min(100, Math.round(relativePosition * 40 + (100 - absolutePenalty))));

    const isPeak = pt.pm25 >= maxPm25 * 0.90 && pt.pm25 > 120;
    const isClean = pt.pm25 <= minPm25 * 1.15;

    let recommendation = 'Acceptable for routine movement.';
    if (pt.pm25 >= 200) {
      recommendation = 'Avoid outdoor exertion. Seal windows; hazardous particulate density.';
    } else if (pt.pm25 >= 100) {
      recommendation = 'Elevated particulate smog. Restrict heavy exertion to indoors.';
    } else if (isClean) {
      recommendation = 'Relatively cleanest window of the day. Best time for essential outdoor errands.';
    }

    const windowItem: EvaluatedTimeWindow = {
      hourIndex: idx,
      hourLabel: pt.hourLabel,
      pm25: pt.pm25,
      cpcbAqi: pt.cpcbAqi,
      isPeakSmog: isPeak,
      isRelativelyCleaner: isClean,
      suitabilityScore: score,
      recommendation,
    };

    windows.push(windowItem);

    if (pt.pm25 === minPm25 && !cleanest) cleanest = windowItem;
    if (pt.pm25 === maxPm25 && !worst) worst = windowItem;
  });

  return {
    windows,
    cleanestWindow: cleanest,
    worstPeakWindow: worst,
  };
}
