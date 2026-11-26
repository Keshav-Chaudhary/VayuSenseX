import { describe, it, expect, beforeEach } from 'vitest';
import { ImpactLedgerStore, ImpactLedgerEntry } from '../../src/domain/impact';

describe('Impact Ledger State Integrity & Reversion Tests', () => {
  beforeEach(() => {
    ImpactLedgerStore.clearLedger();
  });

  it('reverting completed action to planned drops realized savings back to 0.0 and clears completedAt', () => {
    const entryData: Omit<ImpactLedgerEntry, 'id' | 'deduplicationHash'> = {
      actionId: 'act-purifier-nursery',
      actionTitle: 'HEPA Purifier in Nursery',
      date: '2026-11-21',
      memberId: 'mem-aarav',
      status: 'COMPLETED',
      category: 'INDOOR_PURIFICATION',
      avoidedDoseUg: 120.0,
      avoidedCO2eGrams: 0,
    };

    const record = ImpactLedgerStore.recordAction(entryData);
    expect(record.status).toBe('COMPLETED');
    expect(record.completedAt).toBeDefined();
    expect(ImpactLedgerStore.getSummary().realizedAvoidedDoseUg).toBe(120.0);

    // Revert status to PLANNED
    const reverted = ImpactLedgerStore.updateActionStatus(record.deduplicationHash, 'PLANNED');
    expect(reverted?.status).toBe('PLANNED');
    expect(reverted?.completedAt).toBeUndefined(); // Must be cleared!

    const summaryAfter = ImpactLedgerStore.getSummary();
    expect(summaryAfter.realizedAvoidedDoseUg).toBe(0.0);
    expect(summaryAfter.projectedAvoidedDoseUg).toBe(120.0);
    expect(summaryAfter.completedActionsCount).toBe(0);
    expect(summaryAfter.plannedActionsCount).toBe(1);
  });

  it('strictly enforces deduplication on importLedgerJSON and rejects repeat records from inflating totals', () => {
    const seedRecords: Omit<ImpactLedgerEntry, 'id' | 'deduplicationHash'>[] = [
      {
        actionId: 'act-metro-commute',
        actionTitle: 'Delhi Metro Ride',
        date: '2026-11-20',
        memberId: 'mem-rajesh',
        status: 'COMPLETED',
        category: 'COMMUTE_MODE',
        avoidedDoseUg: 45.0,
        avoidedCO2eGrams: 1500,
      },
    ];

    ImpactLedgerStore.recordAction(seedRecords[0]!);
    expect(ImpactLedgerStore.getEntries().length).toBe(1);

    const exported = ImpactLedgerStore.exportLedgerJSON();

    // Attempt to re-import the exact same exported records
    const result = ImpactLedgerStore.importLedgerJSON(exported);
    expect(result.duplicateCount).toBe(1);
    expect(result.importedCount).toBe(0);

    // Verify ledger count remained exactly 1 (no double-counting inflation)
    expect(ImpactLedgerStore.getEntries().length).toBe(1);
    expect(ImpactLedgerStore.getSummary().realizedAvoidedCO2eGrams).toBe(1500);
  });

  it('safely handles corrupted or invalid JSON strings on import without crashing', () => {
    const result = ImpactLedgerStore.importLedgerJSON('malformed { json: true');
    expect(result.importedCount).toBe(0);
    expect(result.duplicateCount).toBe(0);
  });
});
