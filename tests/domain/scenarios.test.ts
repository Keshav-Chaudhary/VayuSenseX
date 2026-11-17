import { describe, it, expect } from 'vitest';
import { runScenarioComparison } from '../../src/domain/scenarios';

describe('Deterministic Scenario Comparison Engine', () => {
  it('compares an unmitigated smog scenario with a protected indoor routine', () => {
    const report = runScenarioComparison(
      {
        scenarioName: 'Unmitigated Winter Smog',
        hasPurifier: false,
        purifierCADRM3H: 0,
        outdoorExerciseTiming: 'MORNING_PEAK_SMOG',
        commuteMode: 'PETROL_CAR',
        commuteDistanceKm: 18,
        indoorSourcesActive: true,
        outdoorPm25UgM3: 280,
        roomVolumeM3: 45,
      },
      {
        scenarioName: 'VayuSenseX Protected Routine',
        hasPurifier: true,
        purifierCADRM3H: 320,
        outdoorExerciseTiming: 'INDOOR_FILTERED',
        commuteMode: 'METRO_RAIL',
        commuteDistanceKm: 18,
        indoorSourcesActive: false,
        outdoorPm25UgM3: 280,
        roomVolumeM3: 45,
      }
    );

    expect(report.doseReductionPercent).toBeGreaterThan(60);
    expect(report.doseReductionUg).toBeGreaterThan(1000);
    expect(report.co2eReductionGramsPerDay).toBeGreaterThan(2000);
    expect(report.keyDrivers.length).toBeGreaterThanOrEqual(3);
    expect(report.scientificInterpretation).toContain('Modelled simulation indicates an estimated');
  });
});
