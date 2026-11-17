/**
 * Deterministic Daily Environmental Routine Planner Types
 */

import { ActivityType } from '../household/types';

export type ActionCategory = 
  | 'OUTDOOR_TIMING'
  | 'VENTILATION_WINDOW'
  | 'INDOOR_PURIFICATION'
  | 'TRANSIT_SHIFT'
  | 'SOURCE_MITIGATION';

export type ActionStatus = 'SUGGESTED' | 'PLANNED' | 'COMPLETED' | 'SKIPPED';

export interface ActionRecommendation {
  id: string;
  category: ActionCategory;
  title: string;
  actionText: string;
  originalActivityId?: string;
  originalTimeLabel?: string;
  suggestedTimeLabel?: string;
  rationale: string;
  estimatedDoseReductionUg: number;
  estimatedCO2eReductionGrams?: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: ActionStatus;
  supportingFactIds: string[];
}

export interface OptimizedScheduleItem {
  activityId: string;
  label: string;
  activityType: ActivityType;
  environment: 'INDOOR' | 'OUTDOOR' | 'TRANSIT';
  originalStartHour: number;
  originalStartMinute: number;
  suggestedStartHour: number;
  suggestedStartMinute: number;
  durationMinutes: number;
  isModified: boolean;
  modificationReason?: string;
  estimatedDoseBeforeUg: number;
  estimatedDoseAfterUg: number;
  doseReductionPercent: number;
  status: ActionStatus;
}

export interface DailyHouseholdPlan {
  planId: string;
  planDate: string;
  cityName: string;
  overallStrategy: string;
  peakPollutionPeriod: string;
  cleanestAvailablePeriod: string;
  totalDoseBeforeUg: number;
  totalDoseAfterUg: number;
  netDoseReductionPercent: number;
  scheduleItems: OptimizedScheduleItem[];
  recommendations: ActionRecommendation[];
  generatedAt: string;
}
