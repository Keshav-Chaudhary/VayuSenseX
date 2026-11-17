import { FactRegistry, NumericalClaim } from './types';

export interface GroundingValidationResult {
  isValid: boolean;
  errors: string[];
  validatedClaimsCount: number;
}

/**
 * Validates whether an AI-generated explanation adheres strictly to the Fact Registry.
 * Rejects unsupported quantitative claims, mismatched units, and phantom Fact IDs.
 */
export function validateAIGrounding(
  registry: FactRegistry,
  supportingFactIds: string[],
  claims: NumericalClaim[]
): GroundingValidationResult {
  const errors: string[] = [];

  // 1. Verify supportingFactIds exist in the registry
  for (const id of supportingFactIds) {
    if (!registry.facts[id]) {
      errors.push(`Unauthorized Fact ID referenced: "${id}" does not exist in registry.`);
    }
  }

  // 2. Verify all numerical claims match registered values
  let validClaims = 0;
  for (const claim of claims) {
    const registeredFact = registry.facts[claim.factId];
    if (!registeredFact) {
      errors.push(`Claim references unknown fact ID: "${claim.factId}".`);
      continue;
    }

    // Unit match check
    if (claim.unit.trim().toLowerCase() !== registeredFact.unit.trim().toLowerCase()) {
      errors.push(
        `Unit mismatch for "${claim.factId}": AI stated "${claim.unit}" but registered fact is "${registeredFact.unit}".`
      );
    }

    // Numeric value tolerance check (allow small floating point rounding within 5%)
    const diff = Math.abs(claim.statedValue - registeredFact.value);
    const tolerance = Math.max(0.1, registeredFact.value * 0.05);

    if (diff > tolerance) {
      errors.push(
        `Numerical hallucination detected for "${claim.factId}": AI stated ${claim.statedValue} but true engine calculation is ${registeredFact.value} ${registeredFact.unit}.`
      );
    } else {
      validClaims++;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    validatedClaimsCount: validClaims,
  };
}
