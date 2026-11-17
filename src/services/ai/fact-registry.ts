import { EnvironmentalSnapshot } from '../../domain/types';
import { DailyHouseholdPlan } from '../../domain/planner/planner-types';
import { FactRegistry, GroundedFact } from './types';

/**
 * Builds an immutable Fact Registry containing all verified quantitative metrics
 * from deterministic calculation engines and external data providers.
 */
export function buildFactRegistry(
  snapshot: EnvironmentalSnapshot,
  plan?: DailyHouseholdPlan,
  cleanestForecastPm25?: number,
  indoorSteadyStatePm25?: number
): FactRegistry {
  const facts: Record<string, GroundedFact> = {};
  const now = new Date().toISOString();

  // Helper to add fact
  const addFact = (
    id: string,
    value: number | undefined,
    unit: string,
    desc: string,
    source: string,
    provenance: GroundedFact['provenance'] = 'CALCULATED'
  ) => {
    if (value !== undefined && !isNaN(value)) {
      facts[id] = {
        factId: id,
        value: Number(value.toFixed(2)),
        unit,
        description: desc,
        source,
        provenance,
        timestamp: snapshot.timestamp || now,
      };
    }
  };

  // 1. Environmental Telemetry Facts
  addFact(
    'fact-outdoor-pm25-current',
    snapshot.pollutants.pm25,
    'µg/m³',
    'Current outdoor PM2.5 concentration',
    'Open-Meteo European CAMS Telemetry',
    'FORECAST'
  );

  addFact(
    'fact-outdoor-pm10-current',
    snapshot.pollutants.pm10,
    'µg/m³',
    'Current outdoor PM10 concentration',
    'Open-Meteo European CAMS Telemetry',
    'FORECAST'
  );

  addFact(
    'fact-cpcb-aqi',
    snapshot.cpcbAqi.aqi,
    'AQI',
    'Calculated Central Pollution Control Board (India NAQI) index',
    'CPCB Breakpoints Linear Interpolation Engine',
    'CALCULATED'
  );

  addFact(
    'fact-usepa-aqi',
    snapshot.usEpaAqi.aqi,
    'AQI',
    'Calculated US EPA Air Quality Index',
    'US EPA 2024 Technical Assistance Standard',
    'CALCULATED'
  );

  addFact(
    'fact-boundary-layer-height',
    snapshot.weather.boundaryLayerHeight,
    'm',
    'Planetary boundary layer height (inversion indicator)',
    'ECMWF / Open-Meteo Weather Model',
    'FORECAST'
  );

  addFact(
    'fact-surface-wind-speed',
    snapshot.weather.windSpeed,
    'km/h',
    'Surface horizontal wind velocity at 10m',
    'Open-Meteo Surface Weather Analysis',
    'FORECAST'
  );

  addFact(
    'fact-ambient-temperature',
    snapshot.weather.temperature,
    '°C',
    'Ambient 2-meter air temperature',
    'Open-Meteo Weather Model',
    'FORECAST'
  );

  // 2. Cleanest Forecast Window Fact
  if (cleanestForecastPm25 !== undefined) {
    addFact(
      'fact-cleanest-window-pm25',
      cleanestForecastPm25,
      'µg/m³',
      'Minimum PM2.5 concentration forecast during cleanest midday window',
      'Open-Meteo 24-hr Forecast Analysis',
      'FORECAST'
    );
  }

  // 3. Indoor Modelled Concentration Fact
  if (indoorSteadyStatePm25 !== undefined) {
    addFact(
      'fact-indoor-pm25-steady',
      indoorSteadyStatePm25,
      'µg/m³',
      'Modelled steady-state indoor PM2.5 with HEPA filtration active',
      'Single-Zone Mass-Balance Differential Solver',
      'ESTIMATED'
    );
  }

  // 4. Daily Planner Dose Facts
  if (plan) {
    addFact(
      'fact-daily-dose-before',
      plan.totalDoseBeforeUg,
      'µg',
      'Estimated unmitigated daily inhaled particulate mass for the household',
      'US EPA Exposure Factors Dose Engine',
      'ESTIMATED'
    );

    addFact(
      'fact-daily-dose-after',
      plan.totalDoseAfterUg,
      'µg',
      'Estimated daily inhaled particulate mass under optimized VayuSenseX schedule',
      'US EPA Exposure Factors Dose Engine',
      'ESTIMATED'
    );

    addFact(
      'fact-net-dose-reduction-percent',
      plan.netDoseReductionPercent,
      '%',
      'Percentage reduction in daily inhaled particulate mass through schedule optimization',
      'VayuSenseX Deterministic Routine Optimizer',
      'CALCULATED'
    );
  }

  // Common constant facts
  addFact(
    'fact-indoor-incense-rate',
    22000,
    'µg/h',
    'Emission rate of burning single incense stick (agarbatti)',
    'EPA Indoor Environments Division Literature',
    'ESTIMATED'
  );

  return {
    registryId: `reg-${Date.now()}`,
    locationName: snapshot.location.city,
    facts,
    generatedAt: now,
  };
}
