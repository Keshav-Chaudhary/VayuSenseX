import { describe, it, expect } from 'vitest';
import { generateDailyHouseholdPlan } from '../../src/domain/planner';
import { DEFAULT_HOUSEHOLD_PROFILE } from '../../src/domain/household';
import { HourlyForecastPoint } from '../../src/services/environment/types';

describe('Personalized Household Routine Planner & Vulnerability Engine', () => {
  const severeSmogForecast: HourlyForecastPoint[] = Array.from({ length: 24 }).map((_, i) => ({
    timestamp: `2026-11-21T${i.toString().padStart(2, '0')}:00:00`,
    hourLabel: `${i}:00`,
    pm25: i >= 6 && i <= 9 ? 380 : i >= 13 && i <= 16 ? 95 : 220,
    pm10: 450,
    cpcbAqi: 440,
    usepaAqi: 350,
    temperature: 12,
    relativeHumidity: 88,
    windSpeed: 2,
  }));

  it('identifies vulnerable asthmatic child and prioritizes indoor air filtration during morning smog', () => {
    const plan = generateDailyHouseholdPlan(DEFAULT_HOUSEHOLD_PROFILE, severeSmogForecast, 320);

    expect(plan.scheduleItems.length).toBeGreaterThan(0);
    expect(plan.netDoseReductionPercent).toBeGreaterThan(20);

    // Should generate actionable recommendations
    expect(plan.recommendations.length).toBeGreaterThanOrEqual(2);

    // Check that indoor mitigation or timing recommendation is present for severe conditions
    const rec = plan.recommendations.find(r => r.category === 'OUTDOOR_TIMING' || r.category === 'SOURCE_MITIGATION');
    expect(rec).toBeDefined();
  });

  it('guarantees calculated doses are strictly non-negative and mathematically bounded', () => {
    const plan = generateDailyHouseholdPlan(DEFAULT_HOUSEHOLD_PROFILE, severeSmogForecast, 150);

    expect(plan.totalDoseBeforeUg).toBeGreaterThan(0);
    expect(plan.totalDoseAfterUg).toBeGreaterThan(0);
    expect(plan.totalDoseAfterUg).toBeLessThanOrEqual(plan.totalDoseBeforeUg);

    for (const item of plan.scheduleItems) {
      expect(item.estimatedDoseBeforeUg).toBeGreaterThanOrEqual(0);
      expect(item.estimatedDoseAfterUg).toBeGreaterThanOrEqual(0);
      expect(item.estimatedDoseAfterUg).toBeLessThanOrEqual(item.estimatedDoseBeforeUg);
    }
  });

  it('handles empty forecast array gracefully by falling back to current outdoor PM2.5 baseline', () => {
    const plan = generateDailyHouseholdPlan(DEFAULT_HOUSEHOLD_PROFILE, [], 200);

    expect(plan).toBeDefined();
    expect(plan.scheduleItems.length).toBe(DEFAULT_HOUSEHOLD_PROFILE.routine.length);
    expect(plan.totalDoseBeforeUg).toBeGreaterThan(0);
  });
});
