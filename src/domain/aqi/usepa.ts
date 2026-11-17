/**
 * US EPA Air Quality Index (AQI) Calculation Module
 * 
 * Based on the US EPA Technical Assistance Document for the Reporting of Daily Air Quality.
 * Standard formula for sub-index:
 * Ip = [ (I_hi - I_lo) / (B_hi - B_lo) ] * (Cp - B_lo) + I_lo
 */

import { AQICategory, PollutantConcentrations, SubIndexResult } from '../types';

interface EPABreakpoint {
  bLo: number;
  bHi: number;
  iLo: number;
  iHi: number;
  category: AQICategory;
}

// US EPA concentration breakpoints (µg/m³, except CO in ppm)
const EPA_BREAKPOINTS: Record<string, EPABreakpoint[]> = {
  pm25: [
    { bLo: 0.0, bHi: 9.0, iLo: 0, iHi: 50, category: 'GOOD' },
    { bLo: 9.1, bHi: 35.4, iLo: 51, iHi: 100, category: 'MODERATE' },
    { bLo: 35.5, bHi: 55.4, iLo: 101, iHi: 150, category: 'UNHEALTHY_SENSITIVE' },
    { bLo: 55.5, bHi: 125.4, iLo: 151, iHi: 200, category: 'UNHEALTHY' },
    { bLo: 125.5, bHi: 225.4, iLo: 201, iHi: 300, category: 'VERY_UNHEALTHY' },
    { bLo: 225.5, bHi: 325.4, iLo: 301, iHi: 400, category: 'HAZARDOUS' },
    { bLo: 325.5, bHi: 500.4, iLo: 401, iHi: 500, category: 'HAZARDOUS' },
  ],
  pm10: [
    { bLo: 0, bHi: 54, iLo: 0, iHi: 50, category: 'GOOD' },
    { bLo: 55, bHi: 154, iLo: 51, iHi: 100, category: 'MODERATE' },
    { bLo: 155, bHi: 254, iLo: 101, iHi: 150, category: 'UNHEALTHY_SENSITIVE' },
    { bLo: 255, bHi: 354, iLo: 151, iHi: 200, category: 'UNHEALTHY' },
    { bLo: 355, bHi: 424, iLo: 201, iHi: 300, category: 'VERY_UNHEALTHY' },
    { bLo: 425, bHi: 504, iLo: 301, iHi: 400, category: 'HAZARDOUS' },
    { bLo: 505, bHi: 604, iLo: 401, iHi: 500, category: 'HAZARDOUS' },
  ],
  no2: [
    { bLo: 0, bHi: 53, iLo: 0, iHi: 50, category: 'GOOD' },
    { bLo: 54, bHi: 100, iLo: 51, iHi: 100, category: 'MODERATE' },
    { bLo: 101, bHi: 360, iLo: 101, iHi: 150, category: 'UNHEALTHY_SENSITIVE' },
    { bLo: 361, bHi: 649, iLo: 151, iHi: 200, category: 'UNHEALTHY' },
    { bLo: 650, bHi: 1249, iLo: 201, iHi: 300, category: 'VERY_UNHEALTHY' },
    { bLo: 1250, bHi: 1649, iLo: 301, iHi: 400, category: 'HAZARDOUS' },
    { bLo: 1650, bHi: 2049, iLo: 401, iHi: 500, category: 'HAZARDOUS' },
  ],
  o3: [
    { bLo: 0, bHi: 54, iLo: 0, iHi: 50, category: 'GOOD' },
    { bLo: 55, bHi: 70, iLo: 51, iHi: 100, category: 'MODERATE' },
    { bLo: 71, bHi: 85, iLo: 101, iHi: 150, category: 'UNHEALTHY_SENSITIVE' },
    { bLo: 86, bHi: 105, iLo: 151, iHi: 200, category: 'UNHEALTHY' },
    { bLo: 106, bHi: 200, iLo: 201, iHi: 300, category: 'VERY_UNHEALTHY' },
  ],
};

/**
 * Calculate single pollutant sub-index according to US EPA guidelines.
 */
export function calculateUSEPASubIndex(
  pollutant: keyof PollutantConcentrations,
  concentration: number
): SubIndexResult | null {
  if (concentration < 0 || isNaN(concentration)) return null;

  const table = EPA_BREAKPOINTS[pollutant];
  if (!table) return null;

  const last = table[table.length - 1];
  if (last && concentration > last.bHi) {
    return {
      pollutant,
      concentration,
      subIndex: 500,
      category: 'HAZARDOUS',
    };
  }

  for (const bp of table) {
    if (concentration >= bp.bLo && concentration <= bp.bHi) {
      const rawIndex =
        ((bp.iHi - bp.iLo) / (bp.bHi - bp.bLo)) * (concentration - bp.bLo) + bp.iLo;
      const subIndex = Math.min(500, Math.max(0, Math.round(rawIndex)));

      return {
        pollutant,
        concentration,
        subIndex,
        category: bp.category,
      };
    }
  }

  return null;
}

/**
 * Returns human-readable label and UI color for US EPA AQI.
 */
export function getUSEPACategoryMetadata(aqi: number): {
  category: AQICategory;
  label: string;
  color: string;
  implications: string;
  precaution: string;
} {
  if (aqi <= 50) {
    return {
      category: 'GOOD',
      label: 'Good (0–50)',
      color: '#10b981',
      implications: 'Air quality is satisfactory, and air pollution poses little or no risk.',
      precaution: 'Great day for outdoor activities.',
    };
  }
  if (aqi <= 100) {
    return {
      category: 'MODERATE',
      label: 'Moderate (51–100)',
      color: '#f59e0b',
      implications: 'Air quality is acceptable. However, there may be a risk for some people.',
      precaution: 'Unusually sensitive people should consider reducing prolonged exertion.',
    };
  }
  if (aqi <= 150) {
    return {
      category: 'UNHEALTHY_SENSITIVE',
      label: 'Unhealthy for Sensitive Groups (101–150)',
      color: '#f97316',
      implications: 'Members of sensitive groups may experience health effects.',
      precaution: 'People with respiratory or heart disease, children and older adults should limit outdoor exertion.',
    };
  }
  if (aqi <= 200) {
    return {
      category: 'UNHEALTHY',
      label: 'Unhealthy (151–200)',
      color: '#ef4444',
      implications: 'Some members of the general public may experience health effects.',
      precaution: 'Everyone should reduce prolonged or heavy outdoor exertion.',
    };
  }
  if (aqi <= 300) {
    return {
      category: 'VERY_UNHEALTHY',
      label: 'Very Unhealthy (201–300)',
      color: '#8b5cf6',
      implications: 'Health alert: The risk of health effects is increased for everyone.',
      precaution: 'Avoid outdoor activities; run indoor air cleaners.',
    };
  }
  return {
    category: 'HAZARDOUS',
    label: 'Hazardous (301–500)',
    color: '#7f1d1d',
    implications: 'Health warning of emergency conditions: everyone is more likely to be affected.',
    precaution: 'Remain indoors with closed windows and active HEPA air filtration.',
  };
}
