import { HouseholdScenarioConfig, ScenarioComparisonReport } from './types';
import { solveIndoorMassBalance } from '../indoor/mass-balance';
import { calculateInhaledExposure } from '../exposure/dose';
import { ActivityInterval } from '../exposure/types';
import { compareTransportEmissions } from '../sustainability/transport';

/**
 * Builds activity intervals for exposure calculation from a scenario configuration.
 */
function buildIntervalsFromScenario(
  config: HouseholdScenarioConfig,
  computedIndoorPm25: number
): ActivityInterval[] {
  // 1. Sleep: 8 hours in bedroom
  const sleepInterval: ActivityInterval = {
    id: `${config.scenarioName}-sleep`,
    label: 'Sleep in Bedroom (8 hrs)',
    durationMinutes: 480,
    exertionLevel: 'SLEEP',
    environment: 'INDOOR',
    targetPm25UgM3: computedIndoorPm25,
  };

  // 2. Exercise: 45 minutes
  let exerciseInterval: ActivityInterval;
  if (config.outdoorExerciseTiming === 'MORNING_PEAK_SMOG') {
    exerciseInterval = {
      id: `${config.scenarioName}-exercise`,
      label: 'Morning Jog / Outdoor Exercise (7:00 AM)',
      durationMinutes: 45,
      exertionLevel: 'HEAVY_EXERCISE',
      environment: 'OUTDOOR',
      targetPm25UgM3: config.outdoorPm25UgM3 * 1.15, // morning peak inversion concentration
    };
  } else if (config.outdoorExerciseTiming === 'MIDDAY_CLEANEST_WINDOW') {
    exerciseInterval = {
      id: `${config.scenarioName}-exercise`,
      label: 'Midday Outdoor Exercise (Cleanest Window)',
      durationMinutes: 45,
      exertionLevel: 'MODERATE_EXERCISE',
      environment: 'OUTDOOR',
      targetPm25UgM3: config.outdoorPm25UgM3 * 0.65, // well-mixed boundary layer drop
    };
  } else {
    exerciseInterval = {
      id: `${config.scenarioName}-exercise`,
      label: 'Indoor Workout in Filtered Room',
      durationMinutes: 45,
      exertionLevel: 'MODERATE_EXERCISE',
      environment: 'INDOOR',
      targetPm25UgM3: computedIndoorPm25,
    };
  }

  // 3. Commute: Round trip
  const transitConcentration = config.commuteMode === 'METRO_RAIL'
    ? 45 // underground / filtered cabins
    : config.commuteMode === 'PETROL_CAR' || config.commuteMode === 'DIESEL_CAR' || config.commuteMode === 'EV_CAR'
    ? 110 // cabin with AC recirculation
    : config.outdoorPm25UgM3 * 1.1; // direct roadside exposure (bike/walking/bus)

  const commuteInterval: ActivityInterval = {
    id: `${config.scenarioName}-commute`,
    label: `Commute via ${config.commuteMode.replace('_', ' ')} (Round-trip)`,
    durationMinutes: 60,
    exertionLevel: config.commuteMode === 'WALKING' || config.commuteMode === 'CYCLING' ? 'MODERATE_EXERCISE' : 'LIGHT_ACTIVITY',
    environment: 'TRANSIT',
    targetPm25UgM3: transitConcentration,
  };

  // 4. Daytime work/school
  const dayInterval: ActivityInterval = {
    id: `${config.scenarioName}-day`,
    label: 'Office / Daytime Routine',
    durationMinutes: 510,
    exertionLevel: 'SEDENTARY',
    environment: 'INDOOR',
    targetPm25UgM3: Math.max(35, config.outdoorPm25UgM3 * 0.45),
  };

  // 5. Evening Home
  const eveningInterval: ActivityInterval = {
    id: `${config.scenarioName}-evening`,
    label: 'Evening Home Time',
    durationMinutes: 345,
    exertionLevel: 'SEDENTARY',
    environment: 'INDOOR',
    targetPm25UgM3: computedIndoorPm25,
  };

  return [sleepInterval, exerciseInterval, commuteInterval, dayInterval, eveningInterval];
}

/**
 * Runs a deterministic comparison between a Baseline scenario and an Alternative scenario.
 */
export function runScenarioComparison(
  baseline: HouseholdScenarioConfig,
  alternative: HouseholdScenarioConfig
): ScenarioComparisonReport {
  // 1. Solve indoor mass-balance for baseline
  const baselineMb = solveIndoorMassBalance({
    roomVolumeM3: baseline.roomVolumeM3,
    outdoorPm25UgM3: baseline.outdoorPm25UgM3,
    penetrationFactor: 0.75,
    airExchangeRateACH: baseline.hasPurifier ? 0.3 : 0.8,
    depositionRateACH: 0.2,
    purifierCADRM3H: baseline.hasPurifier ? baseline.purifierCADRM3H : 0,
    filterEfficiency: 0.99,
    indoorGenerationRateUgH: baseline.indoorSourcesActive ? 25000 : 0,
  });

  // 2. Solve indoor mass-balance for alternative
  const alternativeMb = solveIndoorMassBalance({
    roomVolumeM3: alternative.roomVolumeM3,
    outdoorPm25UgM3: alternative.outdoorPm25UgM3,
    penetrationFactor: 0.70,
    airExchangeRateACH: alternative.hasPurifier ? 0.25 : 0.8,
    depositionRateACH: 0.2,
    purifierCADRM3H: alternative.hasPurifier ? alternative.purifierCADRM3H : 0,
    filterEfficiency: 0.99,
    indoorGenerationRateUgH: alternative.indoorSourcesActive ? 25000 : 0,
  });

  // 3. Calculate baseline inhaled exposure
  const baselineIntervals = buildIntervalsFromScenario(baseline, baselineMb.steadyStateConcentrationUgM3);
  const baselineExposure = calculateInhaledExposure(baselineIntervals, 'ADULT');

  // 4. Calculate alternative inhaled exposure
  const alternativeIntervals = buildIntervalsFromScenario(alternative, alternativeMb.steadyStateConcentrationUgM3);
  const alternativeExposure = calculateInhaledExposure(alternativeIntervals, 'ADULT');

  // 5. Calculate transport emission differences
  const transportImpact = compareTransportEmissions(
    baseline.commuteDistanceKm,
    baseline.commuteMode,
    alternative.commuteMode,
    5
  );

  const doseReductionUg = Math.max(0, baselineExposure.totalInhaledDoseUg - alternativeExposure.totalInhaledDoseUg);
  const doseReductionPercent = baselineExposure.totalInhaledDoseUg > 0
    ? Math.round((doseReductionUg / baselineExposure.totalInhaledDoseUg) * 100)
    : 0;

  const keyDrivers: string[] = [];
  if (baseline.outdoorExerciseTiming === 'MORNING_PEAK_SMOG' && alternative.outdoorExerciseTiming !== 'MORNING_PEAK_SMOG') {
    keyDrivers.push('Shifting heavy outdoor exertion away from morning thermal inversion peak.');
  }
  if (!baseline.hasPurifier && alternative.hasPurifier) {
    keyDrivers.push(`Operating HEPA purifier (${alternative.purifierCADRM3H} m³/h CADR) in sleeping microenvironment.`);
  }
  if (baseline.indoorSourcesActive && !alternative.indoorSourcesActive) {
    keyDrivers.push('Elimination of high-particulate indoor combustion (incense/mosquito coils).');
  }
  if (baseline.commuteMode !== alternative.commuteMode) {
    keyDrivers.push(`Mode shift from ${baseline.commuteMode.replace('_', ' ')} to ${alternative.commuteMode.replace('_', ' ')}.`);
  }

  const dailyCO2eSavings = Math.round(transportImpact.savingsGramsCO2ePerTrip * 2);

  return {
    baselineScenario: baseline,
    alternativeScenario: alternative,
    baselineExposure,
    alternativeExposure,
    transportImpact,
    doseReductionUg,
    doseReductionPercent,
    co2eReductionGramsPerDay: dailyCO2eSavings,
    keyDrivers,
    scientificInterpretation:
      `Modelled simulation indicates an estimated ${doseReductionPercent}% reduction in total inhaled particulate dose (${doseReductionUg.toLocaleString()} µg avoided) and an estimated ${dailyCO2eSavings.toLocaleString()} g CO₂e avoided per day.`,
    calculatedAt: new Date().toISOString(),
  };
}
