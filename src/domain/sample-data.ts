/**
 * Clearly labelled sample environmental data for demo and fallback operations.
 * Models severe winter smog episodes (e.g. Indo-Gangetic Plains / Delhi NCR)
 * and a comparative moderate coastal city (e.g. Mumbai / Bangalore).
 */

import { EnvironmentalSnapshot } from './types';
import { calculateAQI } from './aqi';

export const SAMPLE_DELHI_SMOG: EnvironmentalSnapshot = (() => {
  const pollutants = {
    pm25: 285.4, // µg/m³ - Severe
    pm10: 412.0, // µg/m³ - Very Poor / Severe
    no2: 84.5,   // µg/m³ - Moderate
    o3: 28.0,    // µg/m³ - Good
    so2: 18.2,   // µg/m³ - Good
    co: 3.4,     // mg/m³ - Moderate
  };

  const weather = {
    temperature: 14.5, // Cold winter morning
    relativeHumidity: 88, // High humidity traps particulates
    windSpeed: 3.2, // km/h - Stagnant air
    windDirection: 295, // NW
    boundaryLayerHeight: 180, // Very shallow inversion layer (meters)
    surfacePressure: 1018,
  };

  return {
    location: {
      city: 'Delhi NCR',
      area: 'Anand Vihar Monitoring Sector',
      latitude: 28.6508,
      longitude: 77.3153,
    },
    timestamp: new Date().toISOString(),
    isSampleData: true,
    source: 'Modelled Winter Smog Simulation (Sample Profile)',
    sourceAttribution: 'VayuSenseX Calibrated Scenario based on CAMS & CPCB Archetype',
    pollutants,
    weather,
    cpcbAqi: calculateAQI(pollutants, 'CPCB'),
    usEpaAqi: calculateAQI(pollutants, 'USEPA'),
    stagnationRisk: 'CRITICAL',
  };
})();

export const SAMPLE_BENGALURU_MODERATE: EnvironmentalSnapshot = (() => {
  const pollutants = {
    pm25: 38.0, // µg/m³ - Satisfactory (CPCB) / Moderate (USEPA)
    pm10: 72.0, // µg/m³ - Satisfactory
    no2: 32.0,  // µg/m³ - Good
    o3: 45.0,   // µg/m³ - Good
    so2: 9.0,   // µg/m³ - Good
    co: 0.9,    // mg/m³ - Good
  };

  const weather = {
    temperature: 24.0,
    relativeHumidity: 55,
    windSpeed: 14.5, // Good dispersion
    windDirection: 110,
    boundaryLayerHeight: 850, // Well-mixed boundary layer
    surfacePressure: 1012,
  };

  return {
    location: {
      city: 'Bengaluru',
      area: 'BTM Layout Environmental Observatory',
      latitude: 12.9166,
      longitude: 77.6101,
    },
    timestamp: new Date().toISOString(),
    isSampleData: true,
    source: 'Modelled Moderate Urban Simulation (Sample Profile)',
    sourceAttribution: 'VayuSenseX Baseline Scenario',
    pollutants,
    weather,
    cpcbAqi: calculateAQI(pollutants, 'CPCB'),
    usEpaAqi: calculateAQI(pollutants, 'USEPA'),
    stagnationRisk: 'LOW',
  };
})();
