import { describe, it, expect, beforeEach } from 'vitest';
import { ImpactLedgerStore, createDeduplicationHash } from '../../src/domain/impact';
import { ImpactLedgerEntry } from '../../src/domain/impact/types';

describe('Unified Measurable Impact Ledger & Anti-Double-Counting Guard', () => {
  beforeEach(() => {
    ImpactLedgerStore.clearLedger();
  });

  it('generates consistent, deterministic deduplication hashes', () => {
    const hash1 = createDeduplicationHash('act-purifier-night', '2026-11-21', 'mem-aarav');
    const hash2 = createDeduplicationHash('act-purifier-night', '2026-11-21', 'mem-aarav');
    const hash3 = createDeduplicationHash('act-purifier-night', '2026-11-22', 'mem-aarav');

    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(hash3);
    expect(hash1).toContain('hash-');
  });

  it('strictly enforces anti-double-counting guard: SUGGESTED and PLANNED actions contribute 0.0 to realized savings', () => {
    const plannedEntry: Omit<ImpactLedgerEntry, 'id' | 'deduplicationHash'> = {
      actionId: 'act-n95-commute',
      actionTitle: 'Wear N95 Respirator on Metro Commute',
      memberId: 'mem-priya',
      memberName: 'Priya',
      status: 'PLANNED',
      category: 'COMMUTE_MODE',
      date: '2026-11-21',
      avoidedDoseUg: 150.5,
      avoidedCO2eGrams: 0,
      scientificCitation: 'US EPA / CPCB Inhaled Dose Framework',
      verifiedCalculationId: 'CALC-EXP-95',
    };

    ImpactLedgerStore.recordAction(plannedEntry);
    const summary = ImpactLedgerStore.getSummary();

    // Must be strictly 0 realized since status is PLANNED
    expect(summary.realizedAvoidedDoseUg).toBe(0);
    expect(summary.projectedAvoidedDoseUg).toBe(150.5);
    expect(summary.plannedActionsCount).toBe(1);
    expect(summary.completedActionsCount).toBe(0);
  });

  it('updates realized totals only when transition to COMPLETED occurs', () => {
    const entryData: Omit<ImpactLedgerEntry, 'id' | 'deduplicationHash'> = {
      actionId: 'act-metro-switch',
      actionTitle: 'Switch from Solo Petrol Car to Delhi Metro',
      memberId: 'mem-rajesh',
      memberName: 'Rajesh',
      status: 'PLANNED',
      category: 'COMMUTE_MODE',
      date: '2026-11-21',
      avoidedDoseUg: 45.0,
      avoidedCO2eGrams: 2850.0,
      scientificCitation: 'IPCC 2014 & CPCB WTW Methodology',
      verifiedCalculationId: 'CALC-WTW-METRO-01',
    };

    const recorded = ImpactLedgerStore.recordAction(entryData);
    expect(recorded).toBeDefined();
    expect(ImpactLedgerStore.getSummary().realizedAvoidedCO2eGrams).toBe(0);

    // Transition to COMPLETED
    const updated = ImpactLedgerStore.updateActionStatus(recorded.deduplicationHash, 'COMPLETED');
    expect(updated).not.toBeNull();
    expect(updated?.status).toBe('COMPLETED');

    const summaryAfter = ImpactLedgerStore.getSummary();
    expect(summaryAfter.realizedAvoidedCO2eGrams).toBe(2850);
    expect(summaryAfter.realizedAvoidedDoseUg).toBe(45.0);
    expect(summaryAfter.completedActionsCount).toBe(1);
  });

  it('prevents duplicate action creation with same dedupHash on identical day', () => {
    const entryData: Omit<ImpactLedgerEntry, 'id' | 'deduplicationHash'> = {
      actionId: 'act-hepa-continuous',
      actionTitle: 'HEPA Purifier Run in Nursery',
      memberId: 'mem-aarav',
      memberName: 'Aarav',
      status: 'COMPLETED',
      category: 'INDOOR_PURIFICATION',
      date: '2026-11-21',
      avoidedDoseUg: 95.0,
      avoidedCO2eGrams: 420.0,
      scientificCitation: 'Nazaroff Single-Zone Mass Balance',
      verifiedCalculationId: 'CALC-CADR-04',
    };

    const first = ImpactLedgerStore.recordAction(entryData);
    expect(first).toBeDefined();

    // Record second identical action on same day for same member
    const second = ImpactLedgerStore.recordAction(entryData);
    expect(second.id).toBe(first.id); // Same existing record returned, not duplicated

    const entries = ImpactLedgerStore.getEntries();
    expect(entries.length).toBe(1);
  });

  it('exports valid JSON ledger state and clears cleanly', () => {
    const entryData: Omit<ImpactLedgerEntry, 'id' | 'deduplicationHash'> = {
      actionId: 'act-window-seal',
      actionTitle: 'Nocturnal Window Infiltration Seal',
      status: 'COMPLETED',
      category: 'INDOOR_PURIFICATION',
      date: '2026-11-21',
      avoidedDoseUg: 72.0,
      avoidedCO2eGrams: 0,
      scientificCitation: 'Lawrence Berkeley National Lab Infiltration Model',
      verifiedCalculationId: 'CALC-INF-01',
    };

    ImpactLedgerStore.recordAction(entryData);
    const jsonStr = ImpactLedgerStore.exportLedgerJSON();
    expect(jsonStr).toContain('deduplicationHash');

    ImpactLedgerStore.clearLedger();
    expect(ImpactLedgerStore.getEntries().length).toBe(0);
  });
});
