/**
 * Master Deterministic AQI Calculator
 * Evaluates multi-pollutant concentrations against CPCB and US EPA standards.
 */

import { AQIResult, AQIStandard, PollutantConcentrations, SubIndexResult } from '../types';
import { calculateCPCBSubIndex, getCPCBCategoryMetadata } from './cpcb';
import { calculateUSEPASubIndex, getUSEPACategoryMetadata } from './usepa';

export function calculateAQI(
  pollutants: PollutantConcentrations,
  standard: AQIStandard = 'CPCB'
): AQIResult {
  const subIndices: SubIndexResult[] = [];
  const entries = Object.entries(pollutants) as [keyof PollutantConcentrations, number | undefined][];

  for (const [pollutant, val] of entries) {
    if (val !== undefined && val !== null && !isNaN(val)) {
      const sub = standard === 'CPCB' 
        ? calculateCPCBSubIndex(pollutant, val) 
        : calculateUSEPASubIndex(pollutant, val);
      
      if (sub) {
        subIndices.push(sub);
      }
    }
  }

  // If no valid sub-indices could be calculated
  if (subIndices.length === 0) {
    return {
      standard,
      aqi: 0,
      category: 'GOOD',
      categoryLabel: 'No Data',
      categoryColor: '#64748b',
      dominantPollutant: 'pm25',
      subIndices: [],
      healthImplications: 'Insufficient pollutant data to determine index.',
      recommendedPrecaution: 'Awaiting sensor or forecast telemetry.',
      calculatedAt: new Date().toISOString(),
    };
  }

  // The overall AQI is the maximum of the sub-indices (standard environmental science rule)
  subIndices.sort((a, b) => b.subIndex - a.subIndex);
  const highest = subIndices[0]!;

  const metadata = standard === 'CPCB'
    ? getCPCBCategoryMetadata(highest.subIndex)
    : getUSEPACategoryMetadata(highest.subIndex);

  return {
    standard,
    aqi: highest.subIndex,
    category: metadata.category,
    categoryLabel: metadata.label,
    categoryColor: metadata.color,
    dominantPollutant: highest.pollutant,
    subIndices,
    healthImplications: metadata.implications,
    recommendedPrecaution: metadata.precaution,
    calculatedAt: new Date().toISOString(),
  };
}

export { calculateCPCBSubIndex } from './cpcb';
export { calculateUSEPASubIndex } from './usepa';
