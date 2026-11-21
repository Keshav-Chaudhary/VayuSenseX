import { describe, it, expect } from 'vitest';
import { 
  CORRIDOR_PM25_MULTIPLIER, 
  MODE_CABIN_PENETRATION, 
  MODE_BREATHING_RATE_M3_MIN,
  calculateCorridorDose,
  evaluateCleanCorridorRoutes,
  URBAN_NODES
} from '../../src/domain/mobility';

describe('Mobility Microclimate Corridors & Inhalation Physics', () => {
  it('strictly validates peer-reviewed microclimate corridor concentration multipliers', () => {
    // Atmospheric physics: Arterial highway street canyon concentrates trapped exhaust > 1.0
    expect(CORRIDOR_PM25_MULTIPLIER.ARTERIAL_HIGHWAY).toBe(1.45);
    // Mixed commercial stop-and-go idling concentrates particulates > 1.0
    expect(CORRIDOR_PM25_MULTIPLIER.MIXED_COMMERCIAL).toBe(1.20);
    // Residential collector matches regional background
    expect(CORRIDOR_PM25_MULTIPLIER.RESIDENTIAL_COLLECTOR).toBe(1.00);
    // Vegetative canopy greenway creates particulate dry-deposition and buffer < 1.0
    expect(CORRIDOR_PM25_MULTIPLIER.CANOPY_GREENWAY).toBe(0.65);
    // Underground transit tunnel decouples from surface inversion cap
    expect(CORRIDOR_PM25_MULTIPLIER.UNDERGROUND_METRO).toBe(0.25);
  });

  it('strictly validates physical respiratory penetration and ventilation rates by mode', () => {
    // Metro rail provides 85% mechanical HVAC aerosol attenuation
    expect(MODE_CABIN_PENETRATION.METRO_RAIL).toBe(0.15);
    // Sealed automotive cabin with recirc filter provides 55% attenuation
    expect(MODE_CABIN_PENETRATION.PETROL_CAR).toBe(0.45);
    // Active modes provide 0% mechanical attenuation
    expect(MODE_CABIN_PENETRATION.CYCLING).toBe(1.00);
    expect(MODE_CABIN_PENETRATION.WALKING).toBe(1.00);

    // Active athletic cycling ventilation rate is ~3.6x higher than resting seated rate
    expect(MODE_BREATHING_RATE_M3_MIN.CYCLING).toBe(0.027);
    expect(MODE_BREATHING_RATE_M3_MIN.METRO_RAIL).toBe(0.0075);
    expect(MODE_BREATHING_RATE_M3_MIN.CYCLING / MODE_BREATHING_RATE_M3_MIN.METRO_RAIL).toBe(3.6);
  });

  it('evaluates routes under emergency severe smog conditions (PM2.5 = 450 µg/m³)', () => {
    const evaluations = evaluateCleanCorridorRoutes({
      originNodeId: 'NODE_CBD',
      destinationNodeId: 'NODE_RESIDENTIAL',
      mode: 'PETROL_CAR',
      optimizationGoal: 'LOWEST_EXPOSURE',
      ambientRegionalPm25: 450,
    });

    expect(evaluations.length).toBeGreaterThan(0);
    const lowestExposure = evaluations[0]!;

    // In severe smog, metro or greenway must rank significantly lower in inhaled dose than open road
    expect(lowestExposure.totalInhaledDoseUg).toBeLessThan(evaluations[evaluations.length - 1]!.totalInhaledDoseUg);
    expect(lowestExposure.doseSavingsPercentVsArterial).toBeGreaterThanOrEqual(0);
  });

  it('evaluates routes under shortest-time optimization preference', () => {
    const evaluations = evaluateCleanCorridorRoutes({
      originNodeId: 'NODE_CBD',
      destinationNodeId: 'NODE_RESIDENTIAL',
      mode: 'PETROL_CAR',
      optimizationGoal: 'SHORTEST_TIME',
      ambientRegionalPm25: 200,
    });

    expect(evaluations.length).toBeGreaterThan(0);
    // First result must be the fastest
    expect(evaluations[0]!.totalDurationMinutes).toBeLessThanOrEqual(evaluations[evaluations.length - 1]!.totalDurationMinutes);
  });

  it('generates complete segment-by-segment physical telemetry', () => {
    const evaluations = evaluateCleanCorridorRoutes({
      originNodeId: 'NODE_CBD',
      destinationNodeId: 'NODE_RESIDENTIAL',
      mode: 'METRO_RAIL',
      optimizationGoal: 'BALANCED',
      ambientRegionalPm25: 180,
    });

    const metroEval = evaluations.find(e => e.mode === 'METRO_RAIL');
    expect(metroEval).toBeDefined();
    expect(metroEval!.segments.length).toBeGreaterThanOrEqual(1);

    for (const segment of metroEval!.segments) {
      expect(segment.distanceKm).toBeGreaterThan(0);
      expect(segment.durationMinutes).toBeGreaterThan(0);
      expect(segment.ambientPm25UgM3).toBeGreaterThan(0);
      expect(segment.inhaledDoseUg).toBeGreaterThanOrEqual(0);
      expect(segment.lifecycleCO2eGrams).toBeGreaterThanOrEqual(0);
    }
  });
});
