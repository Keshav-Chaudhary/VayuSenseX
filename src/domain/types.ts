/**
 * VayuSenseX Environmental Domain Types
 * Core scientific data models for air quality, weather, and exposure calculations.
 */

export type AQIStandard = 'CPCB' | 'USEPA';

export type AQICategory = 
  | 'GOOD'
  | 'SATISFACTORY' // CPCB only (51-100)
  | 'MODERATE'
  | 'POOR' // CPCB 201-300
  | 'UNHEALTHY_SENSITIVE' // US EPA 101-150
  | 'UNHEALTHY' // US EPA 151-200
  | 'VERY_POOR' // CPCB 301-400
  | 'VERY_UNHEALTHY' // US EPA 201-300
  | 'SEVERE' // CPCB 401-500
  | 'HAZARDOUS'; // US EPA 301-500+

export interface PollutantConcentrations {
  pm25?: number; // µg/m³
  pm10?: number; // µg/m³
  no2?: number;  // µg/m³
  o3?: number;   // µg/m³
  so2?: number;  // µg/m³
  co?: number;   // mg/m³
}

export interface SubIndexResult {
  pollutant: keyof PollutantConcentrations;
  concentration: number;
  subIndex: number;
  category: AQICategory;
}

export interface AQIResult {
  standard: AQIStandard;
  aqi: number;
  category: AQICategory;
  categoryLabel: string;
  categoryColor: string; // Tailwind hex color code
  dominantPollutant: keyof PollutantConcentrations;
  subIndices: SubIndexResult[];
  healthImplications: string;
  recommendedPrecaution: string;
  calculatedAt: string;
}

export interface WeatherConditions {
  temperature: number; // °C
  relativeHumidity: number; // %
  windSpeed: number; // km/h
  windDirection: number; // degrees
  boundaryLayerHeight?: number; // meters above ground
  surfacePressure?: number; // hPa
}

export interface EnvironmentalSnapshot {
  location: {
    city: string;
    area: string;
    latitude: number;
    longitude: number;
  };
  timestamp: string;
  isSampleData: boolean;
  source: string;
  sourceAttribution: string;
  pollutants: PollutantConcentrations;
  weather: WeatherConditions;
  cpcbAqi: AQIResult;
  usEpaAqi: AQIResult;
  stagnationRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
}
