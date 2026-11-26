import React from 'react';
import { ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { FactRegistry } from '../../services/ai/types';

interface GroundingInspectorProps {
  show: boolean;
  onToggle: () => void;
  groundingStatus: string;
  supportingFactIds: string[];
  factRegistry: FactRegistry;
}

export const GroundingInspector: React.FC<GroundingInspectorProps> = ({
  show,
  onToggle,
  groundingStatus,
  supportingFactIds,
  factRegistry,
}) => (
  <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-midnight-900/60">
    <button
      onClick={onToggle}
      className="inline-flex items-center space-x-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
    >
      <ShieldCheck className="w-4 h-4 text-cyan-400" />
      <span>{show ? 'Hide Verification Inspector' : 'Inspect Mathematical Grounding'}</span>
      {show ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
    </button>

    {show && (
      <div className="mt-3 p-4 rounded-xl bg-midnight-950 border border-white/10 space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-white text-xs">Ground-Truth Fact Verification Table</span>
          <span className="font-mono text-[10px] text-slate-400">
            Status: <strong className="text-teal-400">{groundingStatus}</strong>
          </span>
        </div>
        <div className="space-y-2">
          {supportingFactIds.map((fid: string) => {
            const fact = factRegistry.facts[fid];
            if (!fact) return null;
            return (
              <div key={fid} className="p-2.5 rounded-lg bg-midnight-900 border border-white/5 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-mono text-cyan-400 font-bold text-[11px]">#{fid}</span>
                    <span className="text-[11px] text-slate-300">{fact.description}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Provenance: {fact.provenance} • Unit: {fact.unit}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-white text-xs">{fact.value} {fact.unit}</span>
                  <div className="text-[10px] text-teal-400 font-semibold">✓ Verified</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    )}
  </div>
);
