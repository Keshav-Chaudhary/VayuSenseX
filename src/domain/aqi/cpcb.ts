/**
 * CPCB (Central Pollution Control Board, India) AQI Calculation Module
 * 
 * Based on the National Air Quality Index (NAQI) guidelines published by CPCB / MoEFCC.
 * Standard formula for sub-index:
 * Ip = [ (I_hi - I_lo) / (B_hi - B_lo) ] * (Cp - B_lo) + I_lo
 */

import { AQICategory, PollutantConcentrations, SubIndexResult } from '../types';

interface CPCBBreakpoint {
  bLo: number;
  bHi: number;
  iLo: number;
  iHi: number;
  category: AQICategory;
}

// CPCB 24-hr concentration breakpoints (µg/m³, except CO in mg/m³)
const CPCB_BREAKPOINTS: Record<string, CPCBBreakpoint[]> = {
  pm25: [
    { bLo: 0, bHi: 30, iLo: 0, iHi: 50, category: 'GOOD' },
    { bLo: 30.1, bHi: 60, iLo: 51, iHi: 100, category: 'SATISFACTORY' },
    { bLo: 60.1, bHi: 90, iLo: 101, iHi: 200, category: 'MODERATE' },
    { bLo: 90.1, bHi: 120, iLo: 201, iHi: 300, category: 'POOR' },
    { bLo: 120.1, bHi: 250, iLo: 301, iHi: 400, category: 'VERY_POOR' },
    { bLo: 250.1, bHi: 500, iLo: 401, iHi: 500, category: 'SEVERE' },
  ],
  pm10: [
    { bLo: 0, bHi: 50, iLo: 0, iHi: 50, category: 'GOOD' },
    { bLo: 50.1, bHi: 100, iLo: 51, iHi: 100, category: 'SATISFACTORY' },
    { bLo: 100.1, bHi: 250, iLo: 101, iHi: 200, category: 'MODERATE' },
    { bLo: 250.1, bHi: 350, iLo: 201, iHi: 300, category: 'POOR' },
    { bLo: 350.1, bHi: 430, iLo: 301, iHi: 400, category: 'VERY_POOR' },
    { bLo: 430.1, bHi: 600, iLo: 401, iHi: 500, category: 'SEVERE' },
  ],
  no2: [
    { bLo: 0, bHi: 40, iLo: 0, iHi: 50, category: 'GOOD' },
    { bLo: 40.1, bHi: 80, iLo: 51, iHi: 100, category: 'SATISFACTORY' },
    { bLo: 80.1, bHi: 180, iLo: 101, iHi: 200, category: 'MODERATE' },
    { bLo: 180.1, bHi: 280, iLo: 201, iHi: 300, category: 'POOR' },
    { bLo: 280.1, bHi: 400, iLo: 301, iHi: 400, category: 'VERY_POOR' },
    { bLo: 400.1, bHi: 800, iLo: 401, iHi: 500, category: 'SEVERE' },
  ],
  o3: [
    { bLo: 0, bHi: 50, iLo: 0, iHi: 50, category: 'GOOD' },
    { bLo: 50.1, bHi: 100, iLo: 51, iHi: 100, category: 'SATISFACTORY' },
    { bLo: 100.1, bHi: 168, iLo: 101, iHi: 200, category: 'MODERATE' },
    { bLo: 168.1, bHi: 208, iLo: 201, iHi: 300, category: 'POOR' },
    { bLo: 208.1, bHi: 748, iLo: 301, iHi: 400, category: 'VERY_POOR' },
    { bLo: 748.1, bHi: 1000, iLo: 401, iHi: 500, category: 'SEVERE' },
  ],
  so2: [
    { bLo: 0, bHi: 40, iLo: 0, iHi: 50, category: 'GOOD' },
    { bLo: 40.1, bHi: 80, iLo: 51, iHi: 100, category: 'SATISFACTORY' },
    { bLo: 80.1, bHi: 380, iLo: 101, iHi: 200, category: 'MODERATE' },
    { bLo: 380.1, bHi: 800, iLo: 201, iHi: 300, category: 'POOR' },
    { bLo: 800.1, bHi: 1600, iLo: 301, iHi: 400, category: 'VERY_POOR' },
    { bLo: 1600.1, bHi: 2400, iLo: 401, iHi: 500, category: 'SEVERE' },
  ],
  co: [
    { bLo: 0, bHi: 1.0, iLo: 0, iHi: 50, category: 'GOOD' },
    { bLo: 1.01, bHi: 2.0, iLo: 51, iHi: 100, category: 'SATISFACTORY' },
    { bLo: 2.01, bHi: 10.0, iLo: 101, iHi: 200, category: 'MODERATE' },
    { bLo: 10.01, bHi: 17.0, iLo: 201, iHi: 300, category: 'POOR' },
    { bLo: 17.01, bHi: 34.0, iLo: 301, iHi: 400, category: 'VERY_POOR' },
    { bLo: 34.01, bHi: 50.0, iLo: 401, iHi: 500, category: 'SEVERE' },
  ],
};

/**
 * Calculate single pollutant sub-index according to CPCB guidelines.
 */
export function calculateCPCBSubIndex(
  pollutant: keyof PollutantConcentrations,
  concentration: number
): SubIndexResult | null {
  if (concentration < 0 || isNaN(concentration)) return null;

  const table = CPCB_BREAKPOINTS[pollutant];
  if (!table) return null;

  // Handle upper boundary exceeding the table (severe condition)
  const last = table[table.length - 1];
  if (last && concentration > last.bHi) {
    return {
      pollutant,
      concentration,
      subIndex: 500,
      category: 'SEVERE',
    };
  }

  for (const bp of table) {
    if (concentration >= bp.bLo && concentration <= bp.bHi) {
      // Linear interpolation formula
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
 * Returns human-readable label and UI color for CPCB AQI.
 */
export function getCPCBCategoryMetadata(aqi: number): {
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
      color: '#10b981', // green
      implications: 'Minimal impact. Clean, healthy air quality.',
      precaution: 'Ideal for all outdoor activities and natural room ventilation.',
    };
  }
  if (aqi <= 100) {
    return {
      category: 'SATISFACTORY',
      label: 'Satisfactory (51–100)',
      color: '#84cc16', // lime
      implications: 'Minor breathing discomfort to sensitive people.',
      precaution: 'Safe for general public; sensitive individuals should monitor air changes.',
    };
  }
  if (aqi <= 200) {
    return {
      category: 'MODERATE',
      label: 'Moderate (101–200)',
      color: '#f59e0b', // amber
      implications: 'Breathing discomfort to people with lungs, asthma and heart diseases.',
      precaution: 'Sensitive groups should reduce prolonged outdoor exertion.',
    };
  }
  if (aqi <= 300) {
    return {
      category: 'POOR',
      label: 'Poor (201–300)',
      color: '#f97316', // orange
      implications: 'Breathing discomfort to most people on prolonged exposure.',
      precaution: 'Wear N95/FFP2 masks outdoors; run indoor purifiers; keep windows closed.',
    };
  }
  if (aqi <= 400) {
    return {
      category: 'VERY_POOR',
      label: 'Very Poor (301–400)',
      color: '#ef4444', // red
      implications: 'Respiratory illness on prolonged exposure. Significant risk to elderly & children.',
      precaution: 'Avoid outdoor exercise; keep air purifiers active continuously; avoid combustion indoors.',
    };
  }
  return {
    category: 'SEVERE',
    label: 'Severe (401–500+)',
    color: '#7f1d1d', // deep maroon
    implications: 'Affects healthy people and seriously impacts those with existing diseases.',
    precaution: 'Emergency advisory: stay indoors, seal window gaps, use HEPA filtration, avoid all transit.',
  };
}
