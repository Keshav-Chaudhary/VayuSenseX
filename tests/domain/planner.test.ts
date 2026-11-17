import { describe, it, expect } from 'vitest';
import { generateDailyHouseholdPlan } from '../../src/domain/planner';
import { DEFAULT_HOUSEHOLD_PROFILE } from '../../src/domain/household';
import { HourlyForecastPoint } from '../../src/services/environment/types';

describe('Deterministic Routine Planner & Schedule Optimizer', () => {
  const mockForecast: HourlyForecastPoint[] = Array.from({ length: 24 }).map((_, i) => ({
    timestamp: `2026-11-18T${i.toString().padStart(2, '0')}:00:00`,
    hourLabel: `${i}:00`,
    pm25: i >= 5 && i <= 9 ? 280 : i >= 12 && i <= 15 ? 75 : 180, // morning peak 280, midday cleanest 75
    pm10: 350,
    cpcbAqi: i >= 5 && i <= 9 ? 420 : 130,
    usepaAqi: i >= 5 && i <= 9 ? 330 : 160,
    temperature: 15,
    relativeHumidity: 80,
    windSpeed: 4,
  }));

  it('generates an optimized daily plan and shifts morning exercise to indoor/clean window', () => {
    const plan = generateDailyHouseholdPlan(DEFAULT_HOUSEHOLD_PROFILE, mockForecast, 280);

    expect(plan.scheduleItems.length).toBe(DEFAULT_HOUSEHOLD_PROFILE.routine.length);
    expect(plan.totalDoseBeforeUg).toBeGreaterThan(plan.totalDoseAfterUg);
    expect(plan.netDoseReductionPercent).toBeGreaterThan(15);

    // Verify recommendations
    const exerciseRec = plan.recommendations.find((r) => r.category === 'OUTDOOR_TIMING');
    expect(exerciseRec).toBeDefined();
    expect(exerciseRec?.rationale).toContain('Outdoor PM2.5 is forecast at');

    // Verify indoor combustion mitigation recommendation
    const incenseRec = plan.recommendations.find((r) => r.category === 'SOURCE_MITIGATION');
    expect(incenseRec).toBeDefined();
  });
});
