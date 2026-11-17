import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchLiveEnvironmentalData } from '../../src/services/environment/open-meteo';
import { EnvironmentalCache } from '../../src/services/environment/cache';

describe('Open-Meteo Integration & Normalization Service', () => {
  beforeEach(() => {
    EnvironmentalCache.clear();
    vi.restoreAllMocks();
  });

  it('normalizes API payloads, converts CO to mg/m³, and computes dual AQI', async () => {
    // Mock fetch responses
    const mockAirPayload = {
      current: {
        time: '2026-11-17T21:00',
        pm2_5: 220.5,
        pm10: 310.2,
        nitrogen_dioxide: 85.0,
        ozone: 24.0,
        sulphur_dioxide: 15.0,
        carbon_monoxide: 2400.0, // 2400 µg/m³ should convert to 2.4 mg/m³
      },
      hourly: {
        time: ['2026-11-17T21:00', '2026-11-17T22:00'],
        pm2_5: [220.5, 180.0],
        pm10: [310.2, 260.0],
      },
    };

    const mockWeatherPayload = {
      current: {
        time: '2026-11-17T21:00',
        temperature_2m: 14.2,
        relative_humidity_2m: 85,
        wind_speed_10m: 3.5,
        wind_direction_10m: 290,
        surface_pressure: 1016,
      },
      hourly: {
        time: ['2026-11-17T21:00', '2026-11-17T22:00'],
        temperature_2m: [14.2, 13.8],
        relative_humidity_2m: [85, 88],
        wind_speed_10m: [3.5, 3.0],
        boundary_layer_height: [190, 160],
      },
    };

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('air-quality')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockAirPayload),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockWeatherPayload),
      });
    });

    const data = await fetchLiveEnvironmentalData(28.65, 77.31, 'Delhi Test', 'Anand Vihar');

    expect(data.location.city).toBe('Delhi Test');
    expect(data.provenance).toBe('OBSERVED');
    expect(data.pollutants.pm25).toBe(220.5);
    expect(data.pollutants.co).toBe(2.4); // 2400 / 1000
    expect(data.cpcbAqi.category).toBe('VERY_POOR');
    expect(data.usEpaAqi.category).toBe('VERY_UNHEALTHY');
    expect(data.weather.boundaryLayerHeight).toBe(190);
    expect(data.stagnation.stagnationScore).toBeGreaterThanOrEqual(75);
    expect(data.hourlyForecast.length).toBe(2);
    expect(data.cleanestForecastWindow?.pm25).toBe(180);
  });

  it('rejects malformed payloads gracefully with validation errors', async () => {
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ invalidPayload: true }),
      })
    );

    await expect(fetchLiveEnvironmentalData(28.65, 77.31)).rejects.toThrow();
  });
});
