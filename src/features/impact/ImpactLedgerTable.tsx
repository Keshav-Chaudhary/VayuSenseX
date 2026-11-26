import React from 'react';
import { ImpactLedgerEntry, ActionLifecycleStatus } from '../../domain/impact/types';

interface ImpactLedgerTableProps {
  entries: ImpactLedgerEntry[];
  onStatusUpdate: (hash: string, newStatus: ActionLifecycleStatus) => void;
}

export const ImpactLedgerTable: React.FC<ImpactLedgerTableProps> = ({ entries, onStatusUpdate }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left text-xs border-collapse">
      <thead>
        <tr className="border-b border-white/10 text-slate-400 text-[11px]">
          <th className="py-3 px-3">Date</th>
          <th className="py-3 px-3">Action Title</th>
          <th className="py-3 px-3">Category</th>
          <th className="py-3 px-3">Status</th>
          <th className="py-3 px-3 text-right">Avoided PM2.5</th>
          <th className="py-3 px-3 text-right">Avoided CO2e</th>
          <th className="py-3 px-3">Method & Reference</th>
          <th className="py-3 px-3 text-right">Action State</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-white/5">
        {entries.length === 0 ? (
          <tr>
            <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
              No matching ledger entries found. Perform daily planner or household routines to record impact.
            </td>
          </tr>
        ) : (
          entries.map(entry => (
            <tr key={entry.id} className="hover:bg-white/5 transition-colors">
              <td className="py-3 px-3 font-mono text-slate-300">{entry.date}</td>
              <td className="py-3 px-3">
                <span className="font-bold text-white block">{entry.actionTitle}</span>
                {entry.memberName && (
                  <span className="text-[10px] text-slate-400">Member: {entry.memberName}</span>
                )}
              </td>
              <td className="py-3 px-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-midnight-950 text-slate-300 border border-white/5">
                  {entry.category.replace(/_/g, ' ')}
                </span>
              </td>
              <td className="py-3 px-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  entry.status === 'COMPLETED'
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                    : entry.status === 'PLANNED'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : entry.status === 'SKIPPED'
                    ? 'bg-slate-800 text-slate-400'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {entry.status}
                </span>
              </td>
              <td className="py-3 px-3 text-right font-mono font-bold text-teal-300">
                {entry.status === 'COMPLETED' ? `${entry.avoidedDoseUg} µg` : <span className="text-slate-500 italic">({entry.avoidedDoseUg} µg proj.)</span>}
              </td>
              <td className="py-3 px-3 text-right font-mono font-bold text-emerald-300">
                {entry.status === 'COMPLETED' ? `${entry.avoidedCO2eGrams} g` : <span className="text-slate-500 italic">({entry.avoidedCO2eGrams} g proj.)</span>}
              </td>
              <td className="py-3 px-3 text-[11px] text-slate-400 max-w-xs">
                <div className="truncate" title={entry.calculationMethod}>{entry.calculationMethod}</div>
                <div className="text-[10px] text-slate-500 truncate" title={entry.sourceReference}>{entry.sourceReference}</div>
              </td>
              <td className="py-3 px-3 text-right">
                {entry.status === 'PLANNED' && (
                  <button
                    onClick={() => onStatusUpdate(entry.deduplicationHash, 'COMPLETED')}
                    className="px-2 py-1 rounded bg-teal-500 text-midnight-950 font-bold text-[10px] hover:brightness-110"
                  >
                    Mark Done
                  </button>
                )}
                {entry.status === 'COMPLETED' && (
                  <span className="text-teal-400 text-[10px] font-bold">✓ Logged</span>
                )}
                {entry.status === 'SUGGESTED' && (
                  <button
                    onClick={() => onStatusUpdate(entry.deduplicationHash, 'PLANNED')}
                    className="px-2 py-1 rounded bg-cyan-500/20 text-cyan-300 font-bold text-[10px] hover:bg-cyan-500/30"
                  >
                    Plan
                  </button>
                )}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);
