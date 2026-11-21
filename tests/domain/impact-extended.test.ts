import { describe, it, expect, beforeEach } from 'vitest';
import { ImpactLedgerStore, ImpactLedgerEntry } from '../../src/domain/impact';

describe('Impact Ledger Auditability & Category Aggregation', () => {
  beforeEach(() => {
    ImpactLedgerStore.clearLedger();
  });

  it('aggregates category-specific summaries accurately across distinct intervention types', () => {
    const entries: Omit<ImpactLedgerEntry, 'id' | 'deduplicationHash'>[] = [
      {
        actionId: 'act-indoor-01',
        actionTitle: 'Nocturnal Bedroom HEPA Operation',
        status: 'COMPLETED',
        category: 'INDOOR_PURIFICATION',
        date: '2026-11-20',
        avoidedDoseUg: 88.0,
        avoidedCO2eGrams: 350,
      },
      {
        actionId: 'act-routine-01',
        actionTitle: 'Reschedule Jogging to Afternoon Window',
        status: 'COMPLETED',
        category: 'ROUTINE_SHIFT',
        date: '2026-11-20',
        avoidedDoseUg: 240.0,
        avoidedCO2eGrams: 0,
      },
      {
        actionId: 'act-commute-01',
        actionTitle: 'Switch to Delhi Metro Rail',
        status: 'PLANNED',
        category: 'COMMUTE_MODE',
        date: '2026-11-20',
        avoidedDoseUg: 65.0,
        avoidedCO2eGrams: 1800,
      },
    ];

    for (const entry of entries) {
      ImpactLedgerStore.recordAction(entry);
    }

    const summary = ImpactLedgerStore.getSummary();
    expect(summary.completedActionsCount).toBe(2);
    expect(summary.plannedActionsCount).toBe(1);

    // Realized vs projected checks
    expect(summary.realizedAvoidedDoseUg).toBe(88.0 + 240.0);
    expect(summary.realizedAvoidedCO2eGrams).toBe(350);
    expect(summary.projectedAvoidedDoseUg).toBe(65.0);
    expect(summary.projectedAvoidedCO2eGrams).toBe(1800);

    // Breakdown checks
    expect(summary.categoryBreakdown.INDOOR_PURIFICATION.completedCount).toBe(1);
    expect(summary.categoryBreakdown.INDOOR_PURIFICATION.avoidedDoseUg).toBe(88.0);
    expect(summary.categoryBreakdown.ROUTINE_SHIFT.completedCount).toBe(1);
    expect(summary.categoryBreakdown.COMMUTE_MODE.plannedCount).toBe(1);
  });

  it('filters summary by date boundaries', () => {
    ImpactLedgerStore.recordAction({
      actionId: 'act-day1',
      actionTitle: 'Day 1 HEPA',
      status: 'COMPLETED',
      category: 'INDOOR_PURIFICATION',
      date: '2026-11-15',
      avoidedDoseUg: 50.0,
      avoidedCO2eGrams: 100,
    });

    ImpactLedgerStore.recordAction({
      actionId: 'act-day2',
      actionTitle: 'Day 2 HEPA',
      status: 'COMPLETED',
      category: 'INDOOR_PURIFICATION',
      date: '2026-11-20',
      avoidedDoseUg: 70.0,
      avoidedCO2eGrams: 120,
    });

    const fullSummary = ImpactLedgerStore.getSummary();
    expect(fullSummary.completedActionsCount).toBe(2);

    const filteredSummary = ImpactLedgerStore.getSummary('2026-11-19', '2026-11-21');
    expect(filteredSummary.completedActionsCount).toBe(1);
    expect(filteredSummary.realizedAvoidedDoseUg).toBe(70.0);
  });
});
