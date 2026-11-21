/**
 * Unified Measurable Impact Ledger Types
 * Enforces strict distinction between Suggested, Planned, and Completed actions,
 * preventing double-counting and separating estimated from completed impact.
 */

export type ActionLifecycleStatus = 'SUGGESTED' | 'PLANNED' | 'COMPLETED' | 'SKIPPED';

export type ImpactCategory = 
  | 'INDOOR_PURIFICATION'
  | 'ROUTINE_SHIFT'
  | 'COMMUTE_MODE'
  | 'SOURCE_MITIGATION'
  | 'COMMUNITY_PLEDGE';

export type ConfidenceTier = 
  | 'MEASURED_SENSOR'
  | 'CALCULATED_HIGH'
  | 'ESTIMATED_MODERATE';

export interface ImpactLedgerEntry {
  id: string;
  deduplicationHash: string; // hash(actionId + date + (memberId || 'household'))
  actionId: string;
  actionTitle: string;
  category: ImpactCategory;
  status: ActionLifecycleStatus;
  date: string; // YYYY-MM-DD
  memberId?: string;
  memberName?: string;
  suggestedAt: string;
  plannedAt?: string;
  completedAt?: string;
  avoidedDoseUg: number; // PM2.5 particulate mass avoided (micrograms)
  avoidedCO2eGrams: number; // Greenhouse gas emissions avoided (grams CO2e)
  calculationMethod: string;
  sourceReference: string;
  confidenceTier: ConfidenceTier;
}

export interface CategoryImpactSummary {
  avoidedDoseUg: number;
  avoidedCO2eGrams: number;
  completedCount: number;
  plannedCount: number;
}

export interface LedgerSummary {
  completedActionsCount: number;
  plannedActionsCount: number;
  suggestedActionsCount: number;
  
  // Realized savings: Computed STRICTLY from COMPLETED actions
  realizedAvoidedDoseUg: number;
  realizedAvoidedCO2eGrams: number;

  // Projected savings: Computed STRICTLY from PLANNED actions
  projectedAvoidedDoseUg: number;
  projectedAvoidedCO2eGrams: number;

  categoryBreakdown: Record<ImpactCategory, CategoryImpactSummary>;
  auditTimestamp: string;
}
