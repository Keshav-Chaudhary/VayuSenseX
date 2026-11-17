/**
 * Indoor Air Quality Mass-Balance and Filtration Engine Types
 */

export interface RoomDimensions {
  lengthM: number;
  widthM: number;
  heightM: number;
}

export interface IndoorModelParameters {
  roomVolumeM3: number;
  outdoorPm25UgM3: number;
  penetrationFactor: number; // P: typical 0.6 to 0.8
  airExchangeRateACH: number; // λ: typical 0.2 (sealed) to 2.0 (open windows)
  depositionRateACH: number;  // k: typical 0.1 to 0.3 h⁻¹ for PM2.5
  purifierCADRM3H: number;    // Q: clean air delivery rate in m³/h
  filterEfficiency: number;   // η: 0.9997 for HEPA, ~0.85 for MERV-13
  indoorGenerationRateUgH: number; // S: indoor emission sources (µg/h)
  initialIndoorPm25UgM3?: number;  // C₀
}

export interface MassBalanceResult {
  steadyStateConcentrationUgM3: number; // Css
  initialConcentrationUgM3: number;     // C0
  concentrationAfterHoursUgM3: number;  // C(t)
  totalRemovalRateACH: number;          // R = λ + k + (η*Q/V)
  penetrationContributionUgM3: number;
  indoorSourceContributionUgM3: number;
  timeTo90PercentCleanupMinutes?: number;
  purifierBenefitPercent: number; // % reduction vs purifier-off scenario
  modelValidity: {
    isValid: boolean;
    issues: string[];
  };
}

export interface CADRSizingResult {
  roomVolumeM3: number;
  targetACH: number;
  requiredCADRM3H: number;
  providedCADRM3H: number;
  achAchieved: number;
  sufficiencyRatio: number; // provided / required
  assessment: 'INSUFFICIENT' | 'ACCEPTABLE' | 'OPTIMAL' | 'OVERSIZED';
}

export interface DIYFilterConfig {
  fanFlowM3H: number;
  filterType: 'MERV13' | 'MERV11' | 'HEPA_CANISTER';
  singlePassEfficiency: number;
  estimatedCADRM3H: number;
  estimatedCostUSD: number;
  maintenanceNote: string;
}
