import React from 'react';
import { runScenarioComparison } from '../../domain/scenarios';

interface SimulationOutcomeDeckProps {
  report: ReturnType<typeof runScenarioComparison>;
}

export const SimulationOutcomeDeck: React.FC<SimulationOutcomeDeckProps> = ({ report }) => (
  <div className="glass-panel rounded-2xl p-6 border border-cyan-500/30 shadow-glow-cyan bg-midnight-900/80 space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-2">
      <div>
        <span className="text-xs font-mono uppercase text-cyan-400 tracking-wider">Simulated Outcome</span>
        <h3 className="text-xl font-bold text-white mt-0.5">Modelled Daily Exposure & Emission Impact</h3>
      </div>
      <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold">
        {report.doseReductionPercent}% Less Inhaled Particulates
      </span>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="p-4 rounded-xl bg-midnight-950 border border-white/5">
        <span className="text-[11px] text-slate-400 font-mono uppercase">Inhaled Dose Avoided</span>
        <div className="text-3xl font-black font-mono text-cyan-300 mt-1">
          {report.doseReductionUg.toLocaleString()}{' '}
          <span className="text-xs font-normal text-slate-400">µg / day</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1">
          From {report.baselineExposure.totalInhaledDoseUg.toLocaleString()} µg down to {report.alternativeExposure.totalInhaledDoseUg.toLocaleString()} µg
        </p>
      </div>

      <div className="p-4 rounded-xl bg-midnight-950 border border-white/5">
        <span className="text-[11px] text-slate-400 font-mono uppercase">Daily Greenhouse Gas Offset</span>
        <div className="text-3xl font-black font-mono text-emerald-400 mt-1">
          {report.co2eReductionGramsPerDay.toLocaleString()}{' '}
          <span className="text-xs font-normal text-slate-400">g CO₂e / day</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1">
          ~{((report.co2eReductionGramsPerDay * 365) / 1000).toFixed(0)} kg CO₂e saved per year
        </p>
      </div>

      <div className="p-4 rounded-xl bg-midnight-950 border border-white/5">
        <span className="text-[11px] text-slate-400 font-mono uppercase">Key Decision Drivers</span>
        <ul className="mt-1 space-y-1 text-xs text-slate-300 list-disc pl-3">
          {report.keyDrivers.map((driver, idx) => (
            <li key={idx} className="leading-tight">{driver}</li>
          ))}
        </ul>
      </div>
    </div>

    <p className="text-xs text-slate-300 leading-relaxed border-t border-white/5 pt-3">
      <strong>Scientific Summary:</strong> {report.scientificInterpretation}
    </p>
  </div>
);
