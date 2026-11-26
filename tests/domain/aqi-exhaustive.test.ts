import { describe, it, expect } from 'vitest';
import { calculateAQI } from '../../src/domain/aqi';

const PM25_GRID = Array.from({ length: 101 }, (_, i) => i * 5); // 0, 5, 10, ..., 500

describe('AQI Exhaustive Parameterized Verification (210 Cases)', () => {
  it.each(PM25_GRID)(
    'CPCB NAQI computes valid bounded index and category for PM2.5 = %d µg/m³',
    (pm25) => {
      const res = calculateAQI({ pm25 }, 'CPCB');
      expect(res.aqi).toBeGreaterThanOrEqual(0);
      expect(res.aqi).toBeLessThanOrEqual(500);
      expect(res.dominantPollutant).toBe('pm25');
      expect(res.categoryLabel.length).toBeGreaterThan(0);

      if (pm25 <= 30) expect(res.category).toBe('GOOD');
      else if (pm25 <= 60) expect(res.category).toBe('SATISFACTORY');
      else if (pm25 <= 90) expect(res.category).toBe('MODERATE');
      else if (pm25 <= 120) expect(res.category).toBe('POOR');
      else if (pm25 <= 250) expect(res.category).toBe('VERY_POOR');
      else expect(res.category).toBe('SEVERE');
    }
  );

  it.each(PM25_GRID)(
    'US EPA AQI computes valid bounded index and category for PM2.5 = %d µg/m³',
    (pm25) => {
      const res = calculateAQI({ pm25 }, 'USEPA');
      expect(res.aqi).toBeGreaterThanOrEqual(0);
      expect(res.aqi).toBeLessThanOrEqual(500);
      expect(res.dominantPollutant).toBe('pm25');
      expect(res.categoryLabel.length).toBeGreaterThan(0);

      if (pm25 <= 9) expect(res.category).toBe('GOOD');
      else if (pm25 <= 35) expect(res.category).toBe('MODERATE');
      else if (pm25 > 250) expect(res.category).toBe('HAZARDOUS');
    }
  );

  it.each([
    { pollutants: { pm25: 300, pm10: 50 }, expectedDominant: 'pm25' },
    { pollutants: { pm25: 20, pm10: 420 }, expectedDominant: 'pm10' },
    { pollutants: { pm25: 15, no2: 350 }, expectedDominant: 'no2' },
    { pollutants: { pm25: 15, so2: 700 }, expectedDominant: 'so2' },
    { pollutants: { pm25: 15, co: 25 }, expectedDominant: 'co' },
    { pollutants: { pm25: 15, o3: 320 }, expectedDominant: 'o3' },
    { pollutants: { pm25: 250, pm10: 250, no2: 40, o3: 40 }, expectedDominant: 'pm25' },
    { pollutants: { pm25: 0, pm10: 0, no2: 0, so2: 0, co: 0, o3: 0 }, expectedDominant: 'pm25' },
  ] as const)(
    'identifies governing pollutant $expectedDominant in multi-pollutant mixture',
    ({ pollutants, expectedDominant }) => {
      const res = calculateAQI(pollutants, 'CPCB');
      expect(res.dominantPollutant).toBe(expectedDominant);
      expect(res.subIndices.length).toBeGreaterThanOrEqual(1);
    }
  );
});
