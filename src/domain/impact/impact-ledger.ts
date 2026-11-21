import { 
  ImpactLedgerEntry, 
  ActionLifecycleStatus, 
  ImpactCategory, 
  LedgerSummary, 
  CategoryImpactSummary 
} from './types';

const STORAGE_KEY = 'vayusensex_impact_ledger_v1';
const inMemoryStore = new Map<string, string>();

/**
 * Deterministic SHA-like string hash helper (works in Node and Browser environments).
 */
export function createDeduplicationHash(actionId: string, date: string, memberId = 'household'): string {
  const raw = `${actionId.trim().toLowerCase()}::${date.trim()}::${memberId.trim().toLowerCase()}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `hash-${Math.abs(hash).toString(16)}`;
}

export class ImpactLedgerStore {
  /**
   * Retrieves all ledger entries sorted chronologically descending.
   */
  static getEntries(): ImpactLedgerEntry[] {
    try {
      let raw: string | null = null;
      if (typeof localStorage !== 'undefined') {
        raw = localStorage.getItem(STORAGE_KEY);
      } else {
        raw = inMemoryStore.get(STORAGE_KEY) || null;
      }

      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // Storage unavailable or corrupted JSON
    }
    return [];
  }

  /**
   * Saves entries into persistent storage.
   */
  private static saveEntries(entries: ImpactLedgerEntry[]): void {
    try {
      const serialized = JSON.stringify(entries);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, serialized);
      } else {
        inMemoryStore.set(STORAGE_KEY, serialized);
      }
    } catch (err) {
      console.warn('Failed to persist impact ledger:', err);
    }
  }

  /**
   * Logs an action into the ledger with strict deduplication.
   * If an action with the same deduplicationHash already exists:
   * - Prevents duplicate insertion.
   * - Updates status if advancing (e.g. SUGGESTED -> PLANNED -> COMPLETED).
   */
  static recordAction(entryData: Omit<ImpactLedgerEntry, 'id' | 'deduplicationHash'>): ImpactLedgerEntry {
    const deduplicationHash = createDeduplicationHash(
      entryData.actionId,
      entryData.date,
      entryData.memberId
    );

    const entries = this.getEntries();
    const existingIndex = entries.findIndex(e => e.deduplicationHash === deduplicationHash);

    if (existingIndex >= 0) {
      const existing = entries[existingIndex]!;
      // Update state without duplicating
      const updated: ImpactLedgerEntry = {
        ...existing,
        ...entryData,
        status: entryData.status,
        completedAt: entryData.status === 'COMPLETED' ? (existing.completedAt || new Date().toISOString()) : existing.completedAt,
        plannedAt: entryData.status === 'PLANNED' || entryData.status === 'COMPLETED' ? (existing.plannedAt || new Date().toISOString()) : existing.plannedAt,
      };
      entries[existingIndex] = updated;
      this.saveEntries(entries);
      return updated;
    }

    const newEntry: ImpactLedgerEntry = {
      ...entryData,
      id: `impact-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      deduplicationHash,
      plannedAt: entryData.status === 'PLANNED' ? new Date().toISOString() : undefined,
      completedAt: entryData.status === 'COMPLETED' ? new Date().toISOString() : undefined,
    };

    entries.unshift(newEntry);
    this.saveEntries(entries);
    return newEntry;
  }

  /**
   * Transitions an existing action status (e.g., PLANNED -> COMPLETED).
   */
  static updateActionStatus(deduplicationHash: string, newStatus: ActionLifecycleStatus): ImpactLedgerEntry | null {
    const entries = this.getEntries();
    const index = entries.findIndex(e => e.deduplicationHash === deduplicationHash);
    if (index === -1) return null;

    const existing = entries[index]!;
    const updated: ImpactLedgerEntry = {
      ...existing,
      status: newStatus,
      completedAt: newStatus === 'COMPLETED' ? new Date().toISOString() : existing.completedAt,
      plannedAt: newStatus === 'PLANNED' ? (existing.plannedAt || new Date().toISOString()) : existing.plannedAt,
    };

    entries[index] = updated;
    this.saveEntries(entries);
    return updated;
  }

  /**
   * Computes mathematical summary distinguishing Realized (Completed) from Projected (Planned) impact.
   * GUARANTEE: Suggested or Planned actions NEVER count toward realized savings.
   */
  static getSummary(startDate?: string, endDate?: string): LedgerSummary {
    const entries = this.getEntries().filter(e => {
      if (startDate && e.date < startDate) return false;
      if (endDate && e.date > endDate) return false;
      return true;
    });

    const categories: ImpactCategory[] = [
      'INDOOR_PURIFICATION',
      'ROUTINE_SHIFT',
      'COMMUTE_MODE',
      'SOURCE_MITIGATION',
      'COMMUNITY_PLEDGE',
    ];

    const categoryBreakdown = categories.reduce((acc, cat) => {
      acc[cat] = { avoidedDoseUg: 0, avoidedCO2eGrams: 0, completedCount: 0, plannedCount: 0 };
      return acc;
    }, {} as Record<ImpactCategory, CategoryImpactSummary>);

    let realizedAvoidedDoseUg = 0;
    let realizedAvoidedCO2eGrams = 0;
    let projectedAvoidedDoseUg = 0;
    let projectedAvoidedCO2eGrams = 0;
    let completedActionsCount = 0;
    let plannedActionsCount = 0;
    let suggestedActionsCount = 0;

    for (const entry of entries) {
      const cat = categoryBreakdown[entry.category];

      if (entry.status === 'COMPLETED') {
        completedActionsCount++;
        realizedAvoidedDoseUg += entry.avoidedDoseUg;
        realizedAvoidedCO2eGrams += entry.avoidedCO2eGrams;
        if (cat) {
          cat.completedCount++;
          cat.avoidedDoseUg += entry.avoidedDoseUg;
          cat.avoidedCO2eGrams += entry.avoidedCO2eGrams;
        }
      } else if (entry.status === 'PLANNED') {
        plannedActionsCount++;
        projectedAvoidedDoseUg += entry.avoidedDoseUg;
        projectedAvoidedCO2eGrams += entry.avoidedCO2eGrams;
        if (cat) {
          cat.plannedCount++;
        }
      } else if (entry.status === 'SUGGESTED') {
        suggestedActionsCount++;
      }
    }

    return {
      completedActionsCount,
      plannedActionsCount,
      suggestedActionsCount,
      realizedAvoidedDoseUg: Math.round(realizedAvoidedDoseUg * 10) / 10,
      realizedAvoidedCO2eGrams: Math.round(realizedAvoidedCO2eGrams),
      projectedAvoidedDoseUg: Math.round(projectedAvoidedDoseUg * 10) / 10,
      projectedAvoidedCO2eGrams: Math.round(projectedAvoidedCO2eGrams),
      categoryBreakdown,
      auditTimestamp: new Date().toISOString(),
    };
  }

  static exportLedgerJSON(): string {
    return JSON.stringify(this.getEntries(), null, 2);
  }

  static clearLedger(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      inMemoryStore.delete(STORAGE_KEY);
    }
  }
}
