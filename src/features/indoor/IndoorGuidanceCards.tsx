import React from 'react';
import { Cpu, AlertTriangle } from 'lucide-react';
import { HOUSEPLANT_MYTH_GUIDANCE } from '../../domain/indoor';

interface IndoorGuidanceCardsProps {
  diyFilter: {
    estimatedCADRM3H: number;
    singlePassEfficiency: number;
    estimatedCostUSD: number;
    maintenanceNote: string;
  };
}

export const IndoorGuidanceCards: React.FC<IndoorGuidanceCardsProps> = ({ diyFilter }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* DIY Box Fan Configuration */}
    <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-3">
      <div className="flex items-center space-x-2 text-teal-400 font-bold text-sm">
        <Cpu className="w-4 h-4" />
        <span>DIY Box-Fan Filter Assistant (Corsi-Rosenthal Architecture)</span>
      </div>
      <p className="text-xs text-slate-300 leading-relaxed">
        If commercial HEPA purifiers are cost-prohibitive during winter emergencies, an effective DIY box-fan with a MERV-13 filter achieves high throughput:
      </p>
      <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-midnight-950 border border-white/10 font-mono text-xs">
        <div>
          <span className="text-slate-500 block text-[10px]">ESTIMATED CADR</span>
          <span className="text-teal-300 font-bold text-base">{diyFilter.estimatedCADRM3H} m³/h</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px]">FILTER EFFICIENCY</span>
          <span className="text-white font-bold text-base">{(diyFilter.singlePassEfficiency * 100).toFixed(0)}%</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px]">APPROX COST</span>
          <span className="text-white font-bold text-base">${diyFilter.estimatedCostUSD}</span>
        </div>
      </div>
      <p className="text-[11px] text-slate-400">{diyFilter.maintenanceNote}</p>
    </div>

    {/* Houseplant Myth Card */}
    <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-3 bg-midnight-900/40">
      <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
        <AlertTriangle className="w-4 h-4" />
        <span>{HOUSEPLANT_MYTH_GUIDANCE.summary}</span>
      </div>
      <p className="text-xs text-slate-300 leading-relaxed">
        {HOUSEPLANT_MYTH_GUIDANCE.scientificBasis}
      </p>
      <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200">
        <strong>Evidence-Based Rule: </strong>
        <span>{HOUSEPLANT_MYTH_GUIDANCE.recommendation}</span>
      </div>
    </div>
  </div>
);
