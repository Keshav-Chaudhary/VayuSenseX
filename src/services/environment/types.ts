/**
 * Live Environmental Telemetry Service Types
 */

import { AQIResult, PollutantConcentrations, WeatherConditions } from '../../domain/types';
import { StagnationAssessment } from '../../domain/smog/types';

export type DataProvenance = 
  | 'OBSERVED'      // Direct sensor / assimilated ground reading
  | 'FORECAST'      // Numerical atmosphere model projection
  | 'CALCULATED'    // Deterministic formula output
  | 'ESTIMATED'     // Parametric model with assumed factors
  | 'ILLUSTRATIVE'; // Calibrated demo scenario

export interface HourlyForecastPoint {
  timestamp: string;
  hourLabel: string;
  pm25: number;
  pm10: number;
  cpcbAqi: number;
  usepaAqi: number;
  temperature: number;
  relativeHumidity: number;
  windSpeed: number;
  boundaryLayerHeight?: number;
  isCleanestWindow?: boolean;
}

export interface LiveEnvironmentalData {
  location: {
    city: string;
    area: string;
    latitude: number;
    longitude: number;
    country?: string;
  };
  retrievedAt: string;
  observedAt: string;
  provenance: DataProvenance;
  isStale: boolean;
  isCached: boolean;
  sourceAttribution: string;
  pollutants: PollutantConcentrations;
  weather: WeatherConditions;
  cpcbAqi: AQIResult;
  usEpaAqi: AQIResult;
  stagnation: StagnationAssessment;
  hourlyForecast: HourlyForecastPoint[];
  cleanestForecastWindow?: {
    timestamp: string;
    pm25: number;
    hourLabel: string;
  };
}

export interface LocationSearchResult {
  id: string;
  name: string;
  label: string;
  latitude: number;
  longitude: number;
  country: string;
  state?: string;
}
