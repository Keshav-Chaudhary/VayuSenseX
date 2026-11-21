import { describe, it, expect } from 'vitest';
import { calculateAQI } from '../../src/domain/aqi';

describe('AQI Mathematical Breakpoints & Boundary Conditions', () => {
  it('calculates exact CPCB NAQI at sub-index boundary thresholds', () => {
    // CPCB PM2.5 Breakpoints:
    // Good: 0-30 -> AQI 0-50
    // Satisfactory: 31-60 -> AQI 51-100
    // Moderate: 61-90 -> AQI 101-200
    // Poor: 91-120 -> AQI 201-300
    // Very Poor: 121-250 -> AQI 301-400
    // Severe: 250+ -> AQI 401-500

    const aqiZero = calculateAQI({ pm25: 0 }, 'CPCB');
    expect(aqiZero.aqi).toBe(0);
    expect(aqiZero.category).toBe('GOOD');

    const aqi30 = calculateAQI({ pm25: 30 }, 'CPCB');
    expect(aqi30.aqi).toBe(50);
    expect(aqi30.category).toBe('GOOD');

    const aqi60 = calculateAQI({ pm25: 60 }, 'CPCB');
    expect(aqi60.aqi).toBe(100);
    expect(aqi60.category).toBe('SATISFACTORY');

    const aqi90 = calculateAQI({ pm25: 90 }, 'CPCB');
    expect(aqi90.aqi).toBe(200);
    expect(aqi90.category).toBe('MODERATE');

    const aqi120 = calculateAQI({ pm25: 120 }, 'CPCB');
    expect(aqi120.aqi).toBe(300);
    expect(aqi120.category).toBe('POOR');

    const aqi250 = calculateAQI({ pm25: 250 }, 'CPCB');
    expect(aqi250.aqi).toBe(400);
    expect(aqi250.category).toBe('VERY_POOR');

    const aqiSevere = calculateAQI({ pm25: 380 }, 'CPCB');
    expect(aqiSevere.aqi).toBeGreaterThanOrEqual(400);
    expect(aqiSevere.category).toBe('SEVERE');
  });

  it('calculates US EPA AQI linear piecewise interpolation', () => {
    const epaZero = calculateAQI({ pm25: 0 }, 'USEPA');
    expect(epaZero.aqi).toBe(0);

    const epaModerate = calculateAQI({ pm25: 25 }, 'USEPA');
    expect(epaModerate.aqi).toBeGreaterThan(50);
    expect(epaModerate.aqi).toBeLessThanOrEqual(100);

    const epaHazardous = calculateAQI({ pm25: 300 }, 'USEPA');
    expect(epaHazardous.aqi).toBeGreaterThanOrEqual(300);
    expect(epaHazardous.category).toBe('HAZARDOUS');
  });

  it('determines governing critical pollutant when multiple pollutants are present', () => {
    const multi = calculateAQI({
      pm25: 140, // Very Poor sub-index (~315)
      pm10: 80,  // Satisfactory sub-index (~80)
      no2: 40,   // Good sub-index (~50)
    }, 'CPCB');

    expect(multi.dominantPollutant).toBe('pm25');
    expect(multi.aqi).toBeGreaterThan(300);
  });
});
