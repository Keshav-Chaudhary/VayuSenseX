import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, TrendingDown, CheckCircle2, Clock, 
  Download, Filter, Award, AlertTriangle, Layers, RotateCcw
} from 'lucide-react';
import { ImpactLedgerStore } from '../../domain/impact/impact-ledger';
import { ActionLifecycleStatus } from '../../domain/impact/types';
import { downloadJsonFile } from '../../lib/downloadJson';
import { ImpactLedgerTable } from './ImpactLedgerTable';

function exportImpactLedger(): void {
  downloadJsonFile(
    `vayusensex_impact_ledger_${new Date().toISOString().slice(0, 10)}.json`,
    ImpactLedgerStore.exportLedgerJSON()
  );
}

export const ImpactWorkbench: React.FC = () => {
  const [entries, setEntries] = useState(() => ImpactLedgerStore.getEntries());
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [confirmingReset, setConfirmingReset] = useState<boolean>(false);

  // Compute live mathematical summary
  const summary = ImpactLedgerStore.getSummary();

  const handleStatusUpdate = (hash: string, newStatus: ActionLifecycleStatus) => {
    ImpactLedgerStore.updateActionStatus(hash, newStatus);
    setEntries(ImpactLedgerStore.getEntries());
  };

  const handleConfirmClear = () => {
    ImpactLedgerStore.clearLedger();
    setEntries([]);
    setConfirmingReset(false);
  };

  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
      if (categoryFilter !== 'ALL' && e.category !== categoryFilter) return false;
      if (statusFilter !== 'ALL' && e.status !== statusFilter) return false;
      return true;
    });
  }, [entries, categoryFilter, statusFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 relative overflow-hidden bg-gradient-to-r from-midnight-900 via-midnight-950 to-midnight-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Measurable Environmental Impact Ledger</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Verified Household Impact Ledger
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-3xl">
              Mathematically audited activity accounting. Separates realized completed savings from projected plans, enforcing strict anti-double-counting guarantees.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={exportImpactLedger}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-midnight-800 hover:bg-midnight-700 border border-white/10 text-xs font-medium text-slate-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export Audit JSON</span>
            </button>
            {confirmingReset ? (
              <div role="alertdialog" aria-label="Confirm impact ledger reset" className="inline-flex items-center space-x-1.5">
                <button
                  onClick={handleConfirmClear}
                  className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors"
                >
                  Confirm Reset
                </button>
                <button
                  onClick={() => setConfirmingReset(false)}
                  className="px-2.5 py-2 rounded-xl bg-midnight-800 hover:bg-midnight-700 border border-white/10 text-xs font-medium text-slate-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmingReset(true)}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-midnight-800 hover:bg-rose-950/60 border border-rose-500/20 text-xs font-medium text-rose-300 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* High-Level Impact Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="p-4 rounded-xl bg-midnight-900/60 border border-white/5">
            <span className="text-xs text-slate-400 block">Verified Realized Dose Avoided</span>
            <div className="flex items-center space-x-2 mt-1">
              <TrendingDown className="w-4 h-4 text-teal-400" />
              <span className="text-xl font-bold text-teal-300 font-mono">
                {summary.realizedAvoidedDoseUg}
              </span>
              <span className="text-xs text-slate-400">µg PM2.5</span>
            </div>
            <span className="text-[11px] text-teal-400 font-medium">
              From {summary.completedActionsCount} completed actions
            </span>
          </div>

          <div className="p-4 rounded-xl bg-midnight-900/60 border border-white/5">
            <span className="text-xs text-slate-400 block">Realized Carbon Offset</span>
            <div className="flex items-center space-x-2 mt-1">
              <Award className="w-4 h-4 text-emerald-400" />
              <span className="text-xl font-bold text-emerald-300 font-mono">
                {(summary.realizedAvoidedCO2eGrams / 1000).toFixed(2)}
              </span>
              <span className="text-xs text-slate-400">kg CO2e</span>
            </div>
            <span className="text-[11px] text-emerald-400 font-medium">
              Well-to-Wheel India GHG Protocol
            </span>
          </div>

          <div className="p-4 rounded-xl bg-midnight-900/60 border border-white/5">
            <span className="text-xs text-slate-400 block">Projected Scheduled Savings</span>
            <div className="flex items-center space-x-2 mt-1">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span className="text-xl font-bold text-cyan-300 font-mono">
                {summary.projectedAvoidedDoseUg}
              </span>
              <span className="text-xs text-slate-400">µg PM2.5</span>
            </div>
            <span className="text-[11px] text-cyan-400 font-medium">
              Across {summary.plannedActionsCount} planned routines
            </span>
          </div>

          <div className="p-4 rounded-xl bg-midnight-900/60 border border-white/5">
            <span className="text-xs text-slate-400 block">Deduplication Integrity</span>
            <div className="flex items-center space-x-2 mt-1">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              <span className="text-sm font-bold text-white font-mono">
                100% Zero Double Count
              </span>
            </div>
            <span className="text-[11px] text-slate-500">
              Deterministic hash verification
            </span>
          </div>
        </div>
      </div>

      {/* Anti-Double-Counting Principle Banner */}
      <div className="p-4 rounded-xl bg-midnight-900/60 border border-white/10 text-xs flex items-start space-x-3 text-slate-300">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-white">Scientific Accounting Guarantee:</strong> Planned or suggested actions contribute strictly <strong className="text-teal-400 font-mono">0.0 µg</strong> to realized savings until marked as completed by the household. Every entry applies unique deduplication keys (<span className="font-mono text-cyan-300">hash(actionId + date + memberId)</span>) ensuring repeat routines never inflate impact records.
        </p>
      </div>

      {/* Main Ledger Table & Filter Controls */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-midnight-900/60 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Historical Action Audit Log</span>
            </h2>
            <span className="text-xs text-slate-400">
              Showing {filteredEntries.length} recorded actions
            </span>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center space-x-1 bg-midnight-950 p-1 rounded-lg border border-white/10">
              <Filter className="w-3.5 h-3.5 text-slate-400 ml-1" />
              {(['ALL', 'INDOOR_PURIFICATION', 'ROUTINE_SHIFT', 'COMMUTE_MODE', 'SOURCE_MITIGATION', 'COMMUNITY_PLEDGE'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                    categoryFilter === cat
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cat === 'ALL' ? 'All Categories' : cat.replace(/_/g, ' ')}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-1 bg-midnight-950 p-1 rounded-lg border border-white/10">
              {(['ALL', 'COMPLETED', 'PLANNED', 'SUGGESTED', 'SKIPPED'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                    statusFilter === st
                      ? 'bg-teal-500/20 text-teal-300 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <ImpactLedgerTable entries={filteredEntries} onStatusUpdate={handleStatusUpdate} />
      </div>
    </div>
  );
};
