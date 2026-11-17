/**
 * Atmospheric Stagnation and Smog Intelligence Types
 */

export type DispersionCategory = 
  | 'FAVORABLE'
  | 'MODERATE'
  | 'POOR'
  | 'CRITICAL_STAGNATION'
  | 'INSUFFICIENT_DATA';

export type InversionCompatibility =
  | 'STRONG_INVERSION_CONDITIONS'
  | 'MODERATE_INVERSION_RISK'
  | 'UNLIKELY_WELL_MIXED'
  | 'INSUFFICIENT_DATA';

export interface AtmosphericMetrics {
  boundaryLayerHeight?: number; // meters above ground
  windSpeedKmH?: number;        // km/h
  temperatureC?: number;        // °C
  relativeHumidityPct?: number; // %
  pm25UgM3?: number;            // µg/m³
  pm10UgM3?: number;            // µg/m³
}

export interface StagnationAssessment {
  stagnationScore: number; // 0 (Well dispersed) to 100 (Severe stagnation)
  dispersionCategory: DispersionCategory;
  inversionCompatibility: InversionCompatibility;
  ventilationIndexM2S?: number; // m²/s (PBLH * wind speed in m/s)
  diagnostics: string[];
  recommendation: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  dataAvailability: {
    hasPBLH: boolean;
    hasWind: boolean;
    hasThermal: boolean;
    hasPollutants: boolean;
  };
  calculatedAt: string;
}
