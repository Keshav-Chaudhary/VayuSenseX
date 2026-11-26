import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { FactRegistry } from '../../services/ai/types';

interface FactRegistryPanelProps {
  factRegistry: FactRegistry;
}

export const FactRegistryPanel: React.FC<FactRegistryPanelProps> = React.memo(({ factRegistry }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <span>Today&apos;s Verified Numbers</span>
        </h3>
        <p className="text-xs text-slate-400">Real readings used to answer your questions</p>
      </div>

      <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-midnight-900/60 max-h-[500px] overflow-y-auto space-y-2 text-xs scrollbar-thin">
        {Object.values(factRegistry.facts).map((fact) => (
          <div key={fact.factId} className="p-2.5 rounded-xl bg-midnight-950/80 border border-white/5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-cyan-400 font-bold">#{fact.factId}</span>
              <span className="font-mono text-xs font-bold text-white">{fact.value} {fact.unit}</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">{fact.description}</p>
            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
              <span>Source: {fact.source}</span>
              <span className="font-mono">{fact.provenance}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
