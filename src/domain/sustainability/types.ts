/**
 * Sustainability, Transportation and Household Emissions Engine Types
 */

export type TransportMode = 
  | 'PETROL_CAR'
  | 'DIESEL_CAR'
  | 'EV_CAR'
  | 'MOTORCYCLE'
  | 'BUS'
  | 'METRO_RAIL'
  | 'CARPOOL'
  | 'CYCLING'
  | 'WALKING';

export interface TransportEmissionFactor {
  mode: TransportMode;
  label: string;
  tailpipeGramsCO2ePerKm: number;
  lifecycleGramsCO2ePerKm: number; // Well-to-Wheel / cradle-to-grave
  assumedOccupancy: number;
  source: string;
  notes: string;
}

export interface TransportTrip {
  distanceKm: number;
  currentMode: TransportMode;
  alternativeMode: TransportMode;
  frequencyDaysPerWeek: number;
}

export interface TransportComparisonResult {
  currentTripCO2eGrams: number;
  alternativeTripCO2eGrams: number;
  savingsGramsCO2ePerTrip: number;
  savingsGramsCO2ePerMonth: number;
  savingsKgCO2ePerYear: number;
  equivalentTreesPlanted: number; // ~21 kg CO2 absorbed per urban tree/year
  percentReduction: number;
  distanceKm: number;
  currentMode: TransportMode;
  alternativeMode: TransportMode;
  boundaryNote: string;
}

export interface HouseholdEnergyInputs {
  monthlyElectricityKWh?: number;
  monthlyLpgKg?: number;
}

export interface HouseholdEmissionsResult {
  electricityCO2eKg: number;
  lpgCO2eKg: number;
  totalMonthlyCO2eKg: number;
  factorSources: string[];
}
