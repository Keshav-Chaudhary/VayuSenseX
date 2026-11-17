/**
 * Inhaled Particulate Exposure Dose Engine Types
 */

export type ExertionLevel = 
  | 'SLEEP'
  | 'SEDENTARY'       // Desk work, TV, light household
  | 'LIGHT_ACTIVITY'  // Casual walking, chores
  | 'MODERATE_EXERCISE' // Brisk walking, commute cycling
  | 'HEAVY_EXERCISE'; // Jogging, running, heavy sports

export type DemographyGroup = 
  | 'ADULT'
  | 'CHILD'
  | 'ELDERLY'
  | 'PREGNANT'
  | 'RESPIRATORY_SENSITIVE';

export interface ActivityInterval {
  id: string;
  label: string;
  durationMinutes: number;
  exertionLevel: ExertionLevel;
  environment: 'INDOOR' | 'OUTDOOR' | 'TRANSIT';
  targetPm25UgM3?: number; // Concentration in microenvironment
}

export interface InhaledDoseSegment {
  activityId: string;
  activityLabel: string;
  durationHours: number;
  exertionLevel: ExertionLevel;
  breathingRateM3H: number;
  environment: 'INDOOR' | 'OUTDOOR' | 'TRANSIT';
  concentrationUgM3: number;
  inhaledDoseUg: number; // C * BR * Δt
  volumeAirInhaledM3: number; // BR * Δt
}

export interface ExposureSummary {
  demographicGroup: DemographyGroup;
  totalDurationHours: number;
  totalInhaledDoseUg: number;
  totalVolumeInhaledM3: number;
  averageEffectiveConcentrationUgM3: number;
  indoorDoseUg: number;
  outdoorDoseUg: number;
  transitDoseUg: number;
  segments: InhaledDoseSegment[];
  scientificDisclaimer: string;
  calculatedAt: string;
}
