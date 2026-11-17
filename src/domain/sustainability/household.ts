import { HouseholdEmissionsResult, HouseholdEnergyInputs } from './types';
import { ELECTRICITY_GRID_FACTOR_KG_PER_KWH, LPG_EMISSION_FACTOR_KG_PER_KG } from './emission-factors';

/**
 * Calculates household emissions from utility electricity and cooking fuel consumption.
 */
export function calculateHouseholdEmissions(
  inputs: HouseholdEnergyInputs
): HouseholdEmissionsResult {
  const electricityKWh = Math.max(0, inputs.monthlyElectricityKWh ?? 0);
  const lpgKg = Math.max(0, inputs.monthlyLpgKg ?? 0);

  const electricityCO2eKg = Number((electricityKWh * ELECTRICITY_GRID_FACTOR_KG_PER_KWH).toFixed(1));
  const lpgCO2eKg = Number((lpgKg * LPG_EMISSION_FACTOR_KG_PER_KG).toFixed(1));
  const total = Number((electricityCO2eKg + lpgCO2eKg).toFixed(1));

  return {
    electricityCO2eKg,
    lpgCO2eKg,
    totalMonthlyCO2eKg: total,
    factorSources: [
      `CEA Grid Emission Database v19 (2024): ${ELECTRICITY_GRID_FACTOR_KG_PER_KWH} kg CO₂e/kWh`,
      `IPCC Tier 1 LPG Combustion Factor: ${LPG_EMISSION_FACTOR_KG_PER_KG} kg CO₂e/kg`,
    ],
  };
}
