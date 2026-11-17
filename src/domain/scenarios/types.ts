/**
 * What-If Household Environmental Scenario Comparison Types
 */

import { ExposureSummary } from '../exposure/types';
import { TransportComparisonResult, TransportMode } from '../sustainability/types';

export interface HouseholdScenarioConfig {
  scenarioName: string;
  hasPurifier: boolean;
  purifierCADRM3H: number;
  outdoorExerciseTiming: 'MORNING_PEAK_SMOG' | 'MIDDAY_CLEANEST_WINDOW' | 'INDOOR_FILTERED';
  commuteMode: TransportMode;
  commuteDistanceKm: number;
  indoorSourcesActive: boolean; // e.g. Incense / unvented frying
  outdoorPm25UgM3: number;
  roomVolumeM3: number;
}

export interface ScenarioComparisonReport {
  baselineScenario: HouseholdScenarioConfig;
  alternativeScenario: HouseholdScenarioConfig;
  baselineExposure: ExposureSummary;
  alternativeExposure: ExposureSummary;
  transportImpact: TransportComparisonResult;
  doseReductionUg: number;
  doseReductionPercent: number;
  co2eReductionGramsPerDay: number;
  keyDrivers: string[];
  scientificInterpretation: string;
  calculatedAt: string;
}
