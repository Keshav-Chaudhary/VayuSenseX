import { describe, it, expect } from 'vitest';
import { calculateAQI, calculateCPCBSubIndex, calculateUSEPASubIndex } from '../../src/domain/aqi';

describe('Deterministic AQI Calculation Engine', () => {
  describe('CPCB (India NAQI) Standards', () => {
    it('correctly calculates Good tier for PM2.5 <= 30 µg/m³', () => {
      const res = calculateCPCBSubIndex('pm25', 15);
      expect(res).not.toBeNull();
      expect(res?.subIndex).toBe(25);
      expect(res?.category).toBe('GOOD');
    });

    it('correctly interpolates Moderate tier (61-90 µg/m³)', () => {
      const res = calculateCPCBSubIndex('pm25', 75);
      expect(res).not.toBeNull();
      expect(res?.category).toBe('MODERATE');
      expect(res?.subIndex).toBeGreaterThan(100);
      expect(res?.subIndex).toBeLessThanOrEqual(200);
    });

    it('identifies Severe tier for severe winter smog (> 250 µg/m³ PM2.5)', () => {
      const res = calculateCPCBSubIndex('pm25', 350);
      expect(res).not.toBeNull();
      expect(res?.category).toBe('SEVERE');
      expect(res?.subIndex).toBeGreaterThanOrEqual(400);
    });

    it('handles negative or invalid values gracefully', () => {
      expect(calculateCPCBSubIndex('pm25', -10)).toBeNull();
      expect(calculateCPCBSubIndex('pm25', NaN)).toBeNull();
    });
  });

  describe('US EPA Standards', () => {
    it('correctly calculates Good tier for PM2.5 <= 9.0 µg/m³', () => {
      const res = calculateUSEPASubIndex('pm25', 6.0);
      expect(res).not.toBeNull();
      expect(res?.category).toBe('GOOD');
    });

    it('correctly identifies Unhealthy for Sensitive Groups (35.5 - 55.4 µg/m³)', () => {
      const res = calculateUSEPASubIndex('pm25', 45.0);
      expect(res).not.toBeNull();
      expect(res?.category).toBe('UNHEALTHY_SENSITIVE');
      expect(res?.subIndex).toBeGreaterThan(100);
      expect(res?.subIndex).toBeLessThanOrEqual(150);
    });
  });

  describe('Divergence Validation: CPCB vs US EPA', () => {
    it('proves CPCB and US EPA produce different indices for the exact same concentration', () => {
      // 45 µg/m³ PM2.5:
      // In CPCB: 45 is in SATISFACTORY (30.1 - 60) -> subIndex ~ 76
      // In US EPA: 45 is in UNHEALTHY_SENSITIVE (35.5 - 55.4) -> subIndex ~ 124
      const cpcb = calculateCPCBSubIndex('pm25', 45);
      const usepa = calculateUSEPASubIndex('pm25', 45);

      expect(cpcb?.category).toBe('SATISFACTORY');
      expect(usepa?.category).toBe('UNHEALTHY_SENSITIVE');
      expect(cpcb?.subIndex).not.toEqual(usepa?.subIndex);
    });
  });

  describe('Multi-pollutant Aggregator', () => {
    it('identifies the maximum sub-index as the overall AQI and picks the dominant pollutant', () => {
      // PM10 is 60 (Satisfactory in CPCB), but PM2.5 is 260 (Severe in CPCB)
      const res = calculateAQI({
        pm10: 60,
        pm25: 260,
        no2: 20,
      }, 'CPCB');

      expect(res.standard).toBe('CPCB');
      expect(res.dominantPollutant).toBe('pm25');
      expect(res.category).toBe('SEVERE');
      expect(res.aqi).toBeGreaterThanOrEqual(400);
    });

    it('handles empty or missing pollutant measurements gracefully', () => {
      const res = calculateAQI({}, 'CPCB');
      expect(res.aqi).toBe(0);
      expect(res.categoryLabel).toBe('No Data');
    });
  });
});
