import { DIYFilterConfig } from './types';

/**
 * Common indoor pollution generation rates in µg/hour for PM2.5.
 * Sourced from EPA Indoor Environments Division & LBNL Air Quality studies.
 */
export const INDOOR_POLLUTION_SOURCES: Record<
  string,
  { name: string; generationRateUgH: number; description: string; mitigation: string }
> = {
  incense: {
    name: 'Incense Burning (Agarbatti)',
    generationRateUgH: 22000, // ~22 mg/h of fine particulates
    description: 'A single incense stick generates high concentrations of PM2.5 and benzene derivatives.',
    mitigation: 'Switch to flameless electric diffusers or ventilate immediately post-ceremony.',
  },
  mosquitoCoil: {
    name: 'Mosquito Coil Burning',
    generationRateUgH: 35000, // ~35 mg/h
    description: 'Burning one mosquito coil releases particulate mass comparable to smoking 50-100 cigarettes.',
    mitigation: 'Use sealed electrical vaporizers, insect screens, or bed nets instead of combustion coils.',
  },
  fryingCooking: {
    name: 'High-Heat Frying / Sautéing',
    generationRateUgH: 28000, // ~28 mg/h
    description: 'High-heat oil frying without an exhaust range hood causes sharp particulate spikes.',
    mitigation: 'Operate an external-ducted kitchen exhaust hood with grease pre-filter.',
  },
  candle: {
    name: 'Scented Paraffin Candle',
    generationRateUgH: 2500, // ~2.5 mg/h
    description: 'Scented candles emit soot nanoparticles and volatile organic compounds.',
    mitigation: 'Extinguish with a snuffer; prefer unscented beeswax or soy alternatives.',
  },
  tobaccoSmoke: {
    name: 'Indoor Tobacco Smoking',
    generationRateUgH: 45000, // ~45 mg/h
    description: 'Extremely concentrated particulate mass that embeds into upholstery and carpets.',
    mitigation: 'Maintain a strict 100% smoke-free home policy.',
  },
};

/**
 * Estimates CADR for a DIY Box-Fan Filter (Corsi-Rosenthal Box / MERV-13 Fan).
 */
export function estimateDIYBoxFanCADR(
  fanFlowM3H: number = 750,
  filterType: DIYFilterConfig['filterType'] = 'MERV13'
): DIYFilterConfig {
  const efficiencyMap: Record<DIYFilterConfig['filterType'], { efficiency: number; cost: number; label: string }> = {
    MERV13: { efficiency: 0.85, cost: 45, label: 'Standard 20" Box Fan + MERV-13 4-inch filter' },
    MERV11: { efficiency: 0.65, cost: 35, label: 'Box Fan + MERV-11 filter (lower fine particulate capture)' },
    HEPA_CANISTER: { efficiency: 0.99, cost: 75, label: 'Inline fan with cylindrical HEPA cartridge' },
  };

  const selected = efficiencyMap[filterType];
  const effectiveCADR = Math.round(fanFlowM3H * selected.efficiency);

  return {
    fanFlowM3H,
    filterType,
    singlePassEfficiency: selected.efficiency,
    estimatedCADRM3H: effectiveCADR,
    estimatedCostUSD: selected.cost,
    maintenanceNote:
      'Inspect seal every 30 days. Replace MERV-13 filters every 3-6 months depending on local smog severity.',
  };
}

/**
 * Scientific explanation addressing the common houseplant myth.
 */
export const HOUSEPLANT_MYTH_GUIDANCE = {
  summary: 'Houseplants Cannot Meaningfully Filter Household PM2.5 Smog',
  scientificBasis:
    'While the 1989 NASA Clean Air Study demonstrated VOC uptake in sealed 1 m³ plexiglass chambers over multiple days, real-world households undergo constant air exchange (0.2 to 2.0 ACH). To match the clean air delivery rate (CADR) of even a modest 250 m³/h HEPA purifier, a room would require 100 to 1,000 potted plants per square meter, which is physically impossible and introduces mold and humidity risks.',
  recommendation:
    'Enjoy houseplants for biophilic and psychological wellbeing, but rely on mechanical HEPA/MERV filtration for particulate defense during smog emergencies.',
};
