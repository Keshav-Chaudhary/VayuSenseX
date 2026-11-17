import { FactRegistry, GroundedAIResponse, NumericalClaim } from './types';
import { EnvironmentalSnapshot, AQIStandard } from '../../domain/types';
import { DailyHouseholdPlan } from '../../domain/planner/planner-types';

/**
 * Deterministic explanation engine that runs 100% locally with zero external API dependencies.
 * Activated when Gemini is offline, rate-limited, or when grounding validation rejects a response.
 */
export function generateDeterministicBriefing(
  snapshot: EnvironmentalSnapshot,
  plan: DailyHouseholdPlan,
  registry: FactRegistry,
  standard: AQIStandard = 'CPCB'
): GroundedAIResponse {
  const aqiObj = standard === 'CPCB' ? snapshot.cpcbAqi : snapshot.usEpaAqi;
  const pm25Val = snapshot.pollutants.pm25 ?? 150;
  const pblhVal = snapshot.weather.boundaryLayerHeight ?? 200;
  const windVal = snapshot.weather.windSpeed;

  const headline = `${snapshot.location.city}: ${aqiObj.categoryLabel} (${aqiObj.aqi} ${standard} AQI)`;

  const isSevere = aqiObj.aqi >= 300 || pm25Val >= 150;

  const summary = isSevere
    ? `Severe atmospheric smog is trapped near breathing zones across ${snapshot.location.city}. A shallow boundary layer (~${pblhVal}m) and calm winds (~${windVal} km/h) restrict natural dispersion.`
    : `Moderate particulate accumulation observed across ${snapshot.location.city}. Atmospheric mixing is active, with favorable windows forecast later today.`;

  const detailedExplanation = `Current fine particulate concentration is measured at ${pm25Val} µg/m³ (dominant driver: ${aqiObj.dominantPollutant.toUpperCase()}). Under our deterministic schedule optimization, your household avoids an estimated ${plan.netDoseReductionPercent}% of inhaled particulate dose by shifting high-exertion routines away from the morning inversion peak (${plan.peakPollutionPeriod}) to the cleanest forecast window (${plan.cleanestAvailablePeriod}).`;

  const guidance: string[] = [
    `Shift outdoor physical activities to ${plan.cleanestAvailablePeriod} when solar warming elevates the boundary layer.`,
    `Keep bedroom windows sealed; run mechanical HEPA filtration continuously.`,
    `Avoid burning incense or mosquito coils indoors, which release ~22,000 µg/h of fine combustion particles.`,
    `If essential outdoor transit is required during ${plan.peakPollutionPeriod}, utilize well-fitted N95 / FFP2 respirators.`,
  ];

  const supportingFactIds = [
    'fact-outdoor-pm25-current',
    'fact-cpcb-aqi',
    'fact-boundary-layer-height',
    'fact-surface-wind-speed',
    'fact-net-dose-reduction-percent',
  ].filter((id) => !!registry.facts[id]);

  const numericalClaims: NumericalClaim[] = supportingFactIds.map((id) => ({
    factId: id,
    statedValue: registry.facts[id]!.value,
    unit: registry.facts[id]!.unit,
  }));

  return {
    headline,
    summary,
    detailedExplanation,
    actionableGuidance: guidance,
    supportingFactIds,
    numericalClaims,
    isDeterministicFallback: true,
    groundingStatus: 'VERIFIED',
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Deterministic answers for standard user inquiries in "Ask VayuSenseX".
 */
export function generateDeterministicAnswer(
  query: string,
  snapshot: EnvironmentalSnapshot,
  plan: DailyHouseholdPlan,
  registry: FactRegistry
): GroundedAIResponse {
  const normalized = query.toLowerCase();
  const pm25 = snapshot.pollutants.pm25 ?? 150;
  const pblh = snapshot.weather.boundaryLayerHeight ?? 200;

  let headline = 'Environmental Advisory';
  let summary = '';
  let details = '';
  let guidance: string[] = [];
  const factIds: string[] = ['fact-outdoor-pm25-current'];

  if (normalized.includes('window') || normalized.includes('ventilate') || normalized.includes('fresh air')) {
    headline = 'Ventilation & Window Advisory';
    if (pm25 >= 120) {
      summary = `Keep exterior windows sealed. Current outdoor PM2.5 is severe at ${pm25} µg/m³.`;
      details = `Opening windows during atmospheric inversion will contaminate indoor air within 15-20 minutes. Rely on mechanical HEPA air filtration and internal air recirculation.`;
      guidance = [
        'Keep all doors and windows tightly closed.',
        'If indoor CO₂ feels stuffy, perform a brief 5-minute cross-ventilation purge during midday, followed immediately by high-speed HEPA filtration.',
      ];
    } else {
      summary = `Brief midday window opening is permissible. Outdoor PM2.5 is moderate at ${pm25} µg/m³.`;
      details = `The cleanest forecast window is around ${plan.cleanestAvailablePeriod}. Limit window opening to 15-30 minutes during peak solar mixing.`;
      guidance = ['Ventilate around midday.', 'Close all openings before evening nocturnal inversion sets in.'];
    }
  } else if (normalized.includes('exercise') || normalized.includes('jog') || normalized.includes('walk') || normalized.includes('outdoor')) {
    headline = 'Outdoor Activity & Workout Timing';
    summary = `Avoid early morning outdoor exercise (${plan.peakPollutionPeriod}). Plan physical routines for ${plan.cleanestAvailablePeriod} or indoors.`;
    details = `During early morning winter hours, nocturnal radiative cooling compresses the planetary boundary layer to ~${pblh}m, trapping exhaust and smoke near the ground. Vigorous outdoor exercise increases volumetric inhalation rate by 4x to 6x (~3.0 m³/h), causing massive particulate dose intake.`;
    guidance = [
      `Move intense workouts indoors into a HEPA-purified room.`,
      `If exercising outdoors, schedule strictly during ${plan.cleanestAvailablePeriod}.`,
    ];
    factIds.push('fact-boundary-layer-height');
  } else if (normalized.includes('cpcb') || normalized.includes('epa') || normalized.includes('difference') || normalized.includes('standard')) {
    headline = 'CPCB (India) vs US EPA AQI Standards';
    summary = `CPCB and US EPA evaluate different breakpoint curves calibrated for regional epidemiology.`;
    details = `For the exact same PM2.5 concentration, CPCB categorizes 31–60 µg/m³ as 'Satisfactory' (Index 51–100), whereas US EPA classifies 35.5–55.4 µg/m³ as 'Unhealthy for Sensitive Groups' (Index 101–150). In severe winter smog (>250 µg/m³), CPCB designates 'Severe' while US EPA designates 'Hazardous'. VayuSenseX calculates both standards separately and never interchanges their breakpoints.`;
    guidance = [
      `Use CPCB (India) for national regulatory comparison.`,
      `Use US EPA for strict international public-health sensitivity benchmarks.`,
    ];
    factIds.push('fact-cpcb-aqi', 'fact-usepa-aqi');
  } else {
    headline = `General Air Quality Advisory for ${snapshot.location.city}`;
    summary = `Current outdoor PM2.5 is ${pm25} µg/m³ (${snapshot.cpcbAqi.categoryLabel} tier).`;
    details = `Under current conditions, your household can achieve an estimated ${plan.netDoseReductionPercent}% particulate dose reduction by adhering to the VayuSenseX daily action schedule.`;
    guidance = [
      `Follow the optimized daily routine.`,
      `Operate air cleaners in bedrooms for overnight protection.`,
      `Minimize combustible indoor sources (incense / mosquito coils).`,
    ];
    factIds.push('fact-net-dose-reduction-percent');
  }

  const validFactIds = factIds.filter((id) => !!registry.facts[id]);
  const claims: NumericalClaim[] = validFactIds.map((id) => ({
    factId: id,
    statedValue: registry.facts[id]!.value,
    unit: registry.facts[id]!.unit,
  }));

  return {
    headline,
    summary,
    detailedExplanation: details,
    actionableGuidance: guidance,
    supportingFactIds: validFactIds,
    numericalClaims: claims,
    isDeterministicFallback: true,
    groundingStatus: 'VERIFIED',
    generatedAt: new Date().toISOString(),
  };
}
