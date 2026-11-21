/**
 * Privacy-Preserving Community Resilience & Action Hub Types
 */

export type CommunityPledgeCategory = 
  | 'CARPOOL_TRANSIT'
  | 'CLEAN_HEATING'
  | 'DUST_SUPPRESSION'
  | 'VULNERABLE_CARE'
  | 'SMOG_ADVISORY';

export interface CommunityActionPledge {
  id: string;
  title: string;
  category: CommunityPledgeCategory;
  description: string;
  scientificRationale: string;
  estimatedDailySavingsUgPerCapita: number;
  estimatedDailyCO2eGramsPerCapita: number;
  isPledged: boolean;
  pledgedAt?: string;
  completedDaysCount: number;
}

export interface CommunityAggregatedStats {
  totalActivePledges: number;
  collectiveAvoidedCO2eKg: number;
  collectiveAvoidedPM25Grams: number;
  neighborhoodZone: string;
  provenance: 'CALCULATED_LOCAL' | 'COMMUNITY_OPT_IN';
  privacyGuarantee: string;
}
