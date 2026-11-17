import { z } from 'zod';
import { EnvironmentalCache } from './cache';
import { HourlyForecastPoint, LiveEnvironmentalData } from './types';
import { calculateAQI } from '../../domain/aqi';
import { assessAtmosphericStagnation } from '../../domain/smog';

// Zod schemas for external API validation
const OpenMeteoAirQualitySchema = z.object({
  current: z.object({
    time: z.string(),
    pm2_5: z.number().nullable().optional(),
    pm10: z.number().nullable().optional(),
    nitrogen_dioxide: z.number().nullable().optional(),
    ozone: z.number().nullable().optional(),
    sulphur_dioxide: z.number().nullable().optional(),
    carbon_monoxide: z.number().nullable().optional(),
  }),
  hourly: z.object({
    time: z.array(z.string()),
    pm2_5: z.array(z.number().nullable().optional()),
    pm10: z.array(z.number().nullable().optional()),
  }),
});

const OpenMeteoWeatherSchema = z.object({
  current: z.object({
    time: z.string(),
    temperature_2m: z.number().nullable().optional(),
    relative_humidity_2m: z.number().nullable().optional(),
    wind_speed_10m: z.number().nullable().optional(),
    wind_direction_10m: z.number().nullable().optional(),
    surface_pressure: z.number().nullable().optional(),
  }),
  hourly: z.object({
    time: z.array(z.string()),
    temperature_2m: z.array(z.number().nullable().optional()),
    relative_humidity_2m: z.array(z.number().nullable().optional()),
    wind_speed_10m: z.array(z.number().nullable().optional()),
    boundary_layer_height: z.array(z.number().nullable().optional()).optional(),
  }),
});

/**
 * Fetches and normalizes live environmental telemetry and forecasts from Open-Meteo.
 */
export async function fetchLiveEnvironmentalData(
  latitude: number,
  longitude: number,
  cityName: string = 'Current Location',
  areaName: string = 'Urban Telemetry Grid'
): Promise<LiveEnvironmentalData> {
  const cacheKey = `meteo_${latitude.toFixed(3)}_${longitude.toFixed(3)}`;

  const { data, isCached, isStale } = await EnvironmentalCache.getOrFetch(
    cacheKey,
    async () => {
      const airQualityUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&hourly=pm2_5,pm10&current=pm2_5,pm10,nitrogen_dioxide,ozone,sulphur_dioxide,carbon_monoxide&timezone=auto`;
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,surface_pressure&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,boundary_layer_height&timezone=auto`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

      const [airRes, weatherRes] = await Promise.all([
        fetch(airQualityUrl, { signal: controller.signal }),
        fetch(weatherUrl, { signal: controller.signal }),
      ]);
      clearTimeout(timeoutId);

      if (!airRes.ok || !weatherRes.ok) {
        throw new Error(`Open-Meteo upstream error: Air=${airRes.status}, Weather=${weatherRes.status}`);
      }

      const airJson = await airRes.json();
      const weatherJson = await weatherRes.json();

      const parsedAir = OpenMeteoAirQualitySchema.parse(airJson);
      const parsedWeather = OpenMeteoWeatherSchema.parse(weatherJson);

      return { parsedAir, parsedWeather };
    },
    15 * 60 * 1000 // 15 min TTL
  );

  const { parsedAir, parsedWeather } = data;

  // 1. Normalize Pollutants (Converting CO from µg/m³ to mg/m³)
  const coRaw = parsedAir.current.carbon_monoxide;
  const pollutants = {
    pm25: parsedAir.current.pm2_5 ?? undefined,
    pm10: parsedAir.current.pm10 ?? undefined,
    no2: parsedAir.current.nitrogen_dioxide ?? undefined,
    o3: parsedAir.current.ozone ?? undefined,
    so2: parsedAir.current.sulphur_dioxide ?? undefined,
    co: coRaw !== null && coRaw !== undefined ? Number((coRaw / 1000).toFixed(2)) : undefined,
  };

  // 2. Normalize Weather & Boundary Layer
  const currentPBLH = parsedWeather.hourly.boundary_layer_height?.[0] ?? undefined;
  const weather = {
    temperature: parsedWeather.current.temperature_2m ?? 20,
    relativeHumidity: parsedWeather.current.relative_humidity_2m ?? 50,
    windSpeed: parsedWeather.current.wind_speed_10m ?? 8,
    windDirection: parsedWeather.current.wind_direction_10m ?? 0,
    surfacePressure: parsedWeather.current.surface_pressure ?? 1013,
    boundaryLayerHeight: currentPBLH !== null && currentPBLH !== undefined ? Math.round(currentPBLH) : undefined,
  };

  // 3. Compute Dual AQI Standards (Deterministic Engine)
  const cpcbAqi = calculateAQI(pollutants, 'CPCB');
  const usEpaAqi = calculateAQI(pollutants, 'USEPA');

  // 4. Compute Atmospheric Stagnation & Inversion Diagnostics
  const stagnation = assessAtmosphericStagnation({
    boundaryLayerHeight: weather.boundaryLayerHeight,
    windSpeedKmH: weather.windSpeed,
    temperatureC: weather.temperature,
    relativeHumidityPct: weather.relativeHumidity,
    pm25UgM3: pollutants.pm25,
    pm10UgM3: pollutants.pm10,
  });

  // 5. Construct 24-hr Hourly Forecast Timeline
  const hourlyTimes = parsedAir.hourly.time.slice(0, 24);
  const hourlyPm25 = parsedAir.hourly.pm2_5.slice(0, 24);
  const hourlyPm10 = parsedAir.hourly.pm10.slice(0, 24);
  const hourlyTemp = parsedWeather.hourly.temperature_2m.slice(0, 24);
  const hourlyRH = parsedWeather.hourly.relative_humidity_2m.slice(0, 24);
  const hourlyWind = parsedWeather.hourly.wind_speed_10m.slice(0, 24);
  const hourlyPBLH = parsedWeather.hourly.boundary_layer_height?.slice(0, 24);

  let lowestPm25 = Infinity;
  let cleanestHourIndex = -1;

  const hourlyForecast: HourlyForecastPoint[] = [];

  for (let i = 0; i < hourlyTimes.length; i++) {
    const rawTime = hourlyTimes[i]!;
    const valPm25 = hourlyPm25[i] ?? 0;
    const valPm10 = hourlyPm10[i] ?? 0;

    if (valPm25 < lowestPm25 && valPm25 > 0) {
      lowestPm25 = valPm25;
      cleanestHourIndex = i;
    }

    const d = new Date(rawTime);
    const hourLabel = d.toLocaleTimeString([], { hour: 'numeric', hour12: true });

    const hourPollutants = { pm25: valPm25, pm10: valPm10 };
    const hourCPCB = calculateAQI(hourPollutants, 'CPCB');
    const hourEPA = calculateAQI(hourPollutants, 'USEPA');

    hourlyForecast.push({
      timestamp: rawTime,
      hourLabel,
      pm25: Number(valPm25.toFixed(1)),
      pm10: Number(valPm10.toFixed(1)),
      cpcbAqi: hourCPCB.aqi,
      usepaAqi: hourEPA.aqi,
      temperature: hourlyTemp[i] ?? 20,
      relativeHumidity: hourlyRH[i] ?? 50,
      windSpeed: hourlyWind[i] ?? 8,
      boundaryLayerHeight: hourlyPBLH?.[i] ?? undefined,
    });
  }

  // Tag cleanest window
  if (cleanestHourIndex >= 0 && hourlyForecast[cleanestHourIndex]) {
    hourlyForecast[cleanestHourIndex]!.isCleanestWindow = true;
  }

  const cleanestWindow = cleanestHourIndex >= 0 && hourlyForecast[cleanestHourIndex]
    ? {
        timestamp: hourlyForecast[cleanestHourIndex]!.timestamp,
        pm25: hourlyForecast[cleanestHourIndex]!.pm25,
        hourLabel: hourlyForecast[cleanestHourIndex]!.hourLabel,
      }
    : undefined;

  return {
    location: {
      city: cityName,
      area: areaName,
      latitude,
      longitude,
    },
    retrievedAt: new Date().toISOString(),
    observedAt: parsedAir.current.time,
    provenance: 'FORECAST',
    isStale,
    isCached,
    sourceAttribution: 'Open-Meteo Air Quality & Weather API (Copernicus CAMS & ECMWF Numerical Models)',
    pollutants,
    weather,
    cpcbAqi,
    usEpaAqi,
    stagnation,
    hourlyForecast,
    cleanestForecastWindow: cleanestWindow,
  };
}
