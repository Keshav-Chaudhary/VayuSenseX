import { IndoorModelParameters, MassBalanceResult } from './types';

/**
 * Solves the single-zone indoor mass-balance differential equation:
 * dC_in/dt = P * λ * C_out + (S / V) - (λ + k + η * Q / V) * C_in
 * 
 * Under piecewise-constant parameters over time interval t (hours),
 * the analytical solution is:
 * C_in(t) = C_ss + (C_0 - C_ss) * exp(-R * t)
 * 
 * where:
 * R = λ + k + (η * Q / V)   [total removal rate in h⁻¹]
 * C_ss = (P * λ * C_out + S / V) / R   [steady-state concentration in µg/m³]
 */
export function solveIndoorMassBalance(
  params: IndoorModelParameters,
  durationHours: number = 2.0
): MassBalanceResult {
  const issues: string[] = [];

  const {
    roomVolumeM3,
    outdoorPm25UgM3,
    penetrationFactor,
    airExchangeRateACH,
    depositionRateACH,
    purifierCADRM3H,
    filterEfficiency,
    indoorGenerationRateUgH,
    initialIndoorPm25UgM3,
  } = params;

  // Validation
  if (roomVolumeM3 <= 0 || isNaN(roomVolumeM3)) {
    issues.push('Room volume must be greater than zero.');
  }
  if (outdoorPm25UgM3 < 0 || isNaN(outdoorPm25UgM3)) {
    issues.push('Outdoor PM2.5 cannot be negative.');
  }
  if (penetrationFactor < 0 || penetrationFactor > 1.0) {
    issues.push('Penetration factor P must be between 0.0 and 1.0.');
  }
  if (filterEfficiency < 0 || filterEfficiency > 1.0) {
    issues.push('Filter efficiency η must be between 0.0 and 1.0.');
  }
  if (durationHours < 0) {
    issues.push('Duration cannot be negative.');
  }

  const validVolume = Math.max(1, roomVolumeM3);
  const C0 = initialIndoorPm25UgM3 !== undefined && !isNaN(initialIndoorPm25UgM3) && initialIndoorPm25UgM3 >= 0
    ? initialIndoorPm25UgM3
    : outdoorPm25UgM3 * 0.7; // default equilibrium prior to intervention

  // Removal rates (h⁻¹)
  const lambda = Math.max(0, airExchangeRateACH);
  const k = Math.max(0, depositionRateACH);
  const filtrationACH = (Math.max(0, purifierCADRM3H) * Math.max(0, filterEfficiency)) / validVolume;
  const R = lambda + k + filtrationACH;

  // Generation rates (µg/(m³·h))
  const P = Math.max(0, Math.min(1, penetrationFactor));
  const outdoorGenerationRate = P * lambda * Math.max(0, outdoorPm25UgM3);
  const indoorGenerationRate = Math.max(0, indoorGenerationRateUgH) / validVolume;
  const totalGeneration = outdoorGenerationRate + indoorGenerationRate;

  // Steady-state concentration
  let Css = 0;
  let Ct = C0;
  let timeTo90PercentCleanupMinutes: number | undefined = undefined;

  // Handle division by zero / negligible removal rate
  if (R <= 1e-6) {
    Css = Infinity;
    Ct = C0 + totalGeneration * durationHours;
    issues.push('Removal rate is near zero; system will accumulate pollutants indefinitely.');
  } else {
    Css = totalGeneration / R;
    Ct = Css + (C0 - Css) * Math.exp(-R * durationHours);

    // Time to 90% cleanup from initial to steady-state
    if (R > 0.05) {
      timeTo90PercentCleanupMinutes = Math.round((Math.log(10) / R) * 60);
    }
  }

  // Calculate purifier benefit vs purifier-off scenario
  const R_noPurifier = lambda + k;
  let Ct_noPurifier = C0;
  if (R_noPurifier > 1e-6) {
    const Css_noPurifier = totalGeneration / R_noPurifier;
    Ct_noPurifier = Css_noPurifier + (C0 - Css_noPurifier) * Math.exp(-R_noPurifier * durationHours);
  } else {
    Ct_noPurifier = C0 + totalGeneration * durationHours;
  }

  let benefitPercent = 0;
  if (Ct_noPurifier > 0) {
    benefitPercent = Math.max(0, Math.round(((Ct_noPurifier - Ct) / Ct_noPurifier) * 100));
  }

  // Contributions to steady-state
  const penetrationContrib = R > 1e-6 ? outdoorGenerationRate / R : outdoorGenerationRate;
  const sourceContrib = R > 1e-6 ? indoorGenerationRate / R : indoorGenerationRate;

  return {
    steadyStateConcentrationUgM3: Number(Math.max(0, Css).toFixed(1)),
    initialConcentrationUgM3: Number(C0.toFixed(1)),
    concentrationAfterHoursUgM3: Number(Math.max(0, Ct).toFixed(1)),
    totalRemovalRateACH: Number(R.toFixed(2)),
    penetrationContributionUgM3: Number(Math.max(0, penetrationContrib).toFixed(1)),
    indoorSourceContributionUgM3: Number(Math.max(0, sourceContrib).toFixed(1)),
    timeTo90PercentCleanupMinutes,
    purifierBenefitPercent: benefitPercent,
    modelValidity: {
      isValid: issues.length === 0,
      issues,
    },
  };
}
