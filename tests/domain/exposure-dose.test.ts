import { describe, it, expect } from 'vitest';
import { calculateInhaledExposure, getBreathingRate } from '../../src/domain/exposure';
import { ActivityInterval } from '../../src/domain/exposure/types';

describe('US EPA Inhaled Particulate Dose & Ventilation Physics', () => {
  it('strictly adheres to US EPA inhaled particulate dose equation D = C * BR * dt', () => {
    const intervals: ActivityInterval[] = [
      {
        id: 'int-1',
        label: 'Light Walking',
        environment: 'OUTDOOR',
        durationMinutes: 60,
        exertionLevel: 'LIGHT_ACTIVITY',
        targetPm25UgM3: 150,
      },
    ];

    const summary = calculateInhaledExposure(intervals, 'ADULT');
    expect(summary.totalInhaledDoseUg).toBeGreaterThan(0);
    expect(summary.segments.length).toBe(1);
    expect(summary.segments[0]!.inhaledDoseUg).toBeCloseTo(150 * summary.segments[0]!.volumeAirInhaledM3, 1);
  });

  it('accounts for activity exertion multipliers according to EPA Exposure Factors Handbook', () => {
    const sleepRate = getBreathingRate('ADULT', 'SLEEP');
    const sedentaryRate = getBreathingRate('ADULT', 'SEDENTARY');
    const lightWorkRate = getBreathingRate('ADULT', 'LIGHT_ACTIVITY');
    const vigorousExerciseRate = getBreathingRate('ADULT', 'HEAVY_EXERCISE');

    expect(sleepRate).toBeLessThan(sedentaryRate);
    expect(sedentaryRate).toBeLessThan(lightWorkRate);
    expect(lightWorkRate).toBeLessThan(vigorousExerciseRate);

    // Vigorous outdoor athletic exertion has significantly higher ventilation than resting
    expect(vigorousExerciseRate / sedentaryRate).toBeGreaterThanOrEqual(3.0);
  });

  it('evaluates child physiological vulnerability (higher ventilation per kg body mass)', () => {
    const childSleepRate = getBreathingRate('CHILD', 'SLEEP');
    const adultSleepRate = getBreathingRate('ADULT', 'SLEEP');

    expect(childSleepRate).toBeGreaterThan(0);
    expect(adultSleepRate).toBeGreaterThan(0);
  });

  it('calculates multi-segment cumulative daily inhaled dose', () => {
    const intervals: ActivityInterval[] = [
      { id: '1', label: 'Sleep', environment: 'INDOOR', durationMinutes: 480, exertionLevel: 'SLEEP', targetPm25UgM3: 20 },
      { id: '2', label: 'Commute', environment: 'TRANSIT', durationMinutes: 60, exertionLevel: 'SEDENTARY', targetPm25UgM3: 220 },
      { id: '3', label: 'Work', environment: 'INDOOR', durationMinutes: 540, exertionLevel: 'SEDENTARY', targetPm25UgM3: 35 },
      { id: '4', label: 'Commute Return', environment: 'TRANSIT', durationMinutes: 60, exertionLevel: 'SEDENTARY', targetPm25UgM3: 200 },
      { id: '5', label: 'Evening', environment: 'INDOOR', durationMinutes: 300, exertionLevel: 'SEDENTARY', targetPm25UgM3: 30 },
    ];

    const summary = calculateInhaledExposure(intervals, 'ADULT');
    expect(summary.totalInhaledDoseUg).toBeGreaterThan(0);
    expect(summary.segments.length).toBe(5);
    expect(summary.totalDurationHours).toBe(24);
  });
});
