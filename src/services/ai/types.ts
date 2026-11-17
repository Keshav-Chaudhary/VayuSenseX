/**
 * Grounded Generative AI Engine Types
 */

import { DataProvenance } from '../environment/types';

export interface GroundedFact {
  factId: string;
  value: number;
  unit: string;
  description: string;
  source: string;
  provenance: DataProvenance;
  timestamp: string;
}

export interface FactRegistry {
  registryId: string;
  locationName: string;
  facts: Record<string, GroundedFact>;
  generatedAt: string;
}

export interface NumericalClaim {
  factId: string;
  statedValue: number;
  unit: string;
}

export interface GroundedAIResponse {
  headline: string;
  summary: string;
  detailedExplanation: string;
  actionableGuidance: string[];
  supportingFactIds: string[];
  numericalClaims: NumericalClaim[];
  isDeterministicFallback: boolean;
  groundingStatus: 'VERIFIED' | 'FALLBACK_TRIGGERED';
  generatedAt: string;
}
