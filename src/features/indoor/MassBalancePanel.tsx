import React from 'react';
import { INDOOR_POLLUTION_SOURCES } from '../../domain/indoor';

interface MassBalancePanelProps {
  outdoorConcentration: number;
  onOutdoorConcentrationChange: (val: number) => void;
  airExchangeACH: number;
  onAirExchangeACHChange: (val: number) => void;
  activeSources: string[];
  onToggleSource: (key: string) => void;
  massBalanceResult: {
    steadyStateConcentrationUgM3: number;
    purifierBenefitPercent: number;
    timeTo90PercentCleanupMinutes?: number | null;
    totalRemovalRateACH: number;
  };
}

export const MassBalancePanel: React.FC<MassBalancePanelProps> = ({
  outdoorConcentration,
  onOutdoorConcentrationChange,
  airExchangeACH,
  onAirExchangeACHChange,
  activeSources,
  onToggleSource,
  massBalanceResult,
}) => (
  <div className="lg:col-span-7 glass-panel rounded-2xl p-6 border border-white/10 flex flex-col justify-between space-y-6">
    <div>
      <h2 className="text-base font-bold text-white flex items-center justify-between pb-3 border-b border-white/10">
        <span>2. Single-Zone Mass-Balance Differential Solution</span>
        <span className="text-xs font-mono text-cyan-400">Analytical ODE Solver</span>
      </h2>

      {/* Microenvironment inputs: Outdoor & Sources */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="mass-outdoor-pm25" className="text-xs text-slate-300 font-semibold block mb-1">
            Outdoor PM2.5 Concentration (C_out)
          </label>
          <div className="flex items-center space-x-2">
            <input
              id="mass-outdoor-pm25"
              type="range"
              min="10"
              max="500"
              value={outdoorConcentration}
              onChange={(e) => onOutdoorConcentrationChange(parseInt(e.target.value))}
              className="flex-1 accent-cyan-500 cursor-pointer"
            />
            <span className="font-mono font-bold text-xs text-cyan-300 w-16 text-right">
              {outdoorConcentration} µg/m³
            </span>
          </div>
        </div>

        <div>
          <label htmlFor="mass-ventilation-rate" className="text-xs text-slate-300 font-semibold block mb-1">
            Envelope Ventilation Rate (λ)
          </label>
          <select
            id="mass-ventilation-rate"
            value={airExchangeACH}
            onChange={(e) => onAirExchangeACHChange(parseFloat(e.target.value))}
            className="w-full px-3 py-1.5 bg-midnight-900 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none"
          >
            <option value={0.2}>0.2 ACH (Weatherstripped / Sealed)</option>
            <option value={0.4}>0.4 ACH (Standard Closed Windows)</option>
            <option value={1.2}>1.2 ACH (Window Ajar / Drafty)</option>
            <option value={3.0}>3.0 ACH (Open Windows - Cross Flush)</option>
          </select>
        </div>
      </div>

      {/* Indoor Pollution Source Toggles */}
      <div className="mt-5">
        <span className="text-xs font-semibold text-slate-300 block mb-2">
          Active Indoor Pollution Sources (Generation S):
        </span>
        <div className="flex flex-wrap gap-2">
          {Object.entries(INDOOR_POLLUTION_SOURCES).map(([key, src]) => {
            const isActive = activeSources.includes(key);
            return (
              <button
                key={key}
                onClick={() => onToggleSource(key)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-rose-950/70 border-rose-600 text-rose-200'
                    : 'bg-midnight-900/60 border-white/5 text-slate-400 hover:text-slate-200'
                }`}
              >
                {isActive ? '🔥 ' : '+ '}
                {src.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>

    {/* Mass-Balance Solved Metrics Display */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-midnight-900/80 border border-white/10">
      <div>
        <span className="text-[11px] text-slate-400 uppercase font-mono">Steady-State Indoor PM2.5</span>
        <div className="text-3xl font-black font-mono text-cyan-300 mt-1">
          {massBalanceResult.steadyStateConcentrationUgM3}{' '}
          <span className="text-xs font-normal text-slate-400">µg/m³</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-0.5">
          vs {outdoorConcentration} µg/m³ outdoor
        </p>
      </div>

      <div>
        <span className="text-[11px] text-slate-400 uppercase font-mono">Purifier Cleanliness Gain</span>
        <div className="text-3xl font-black font-mono text-emerald-400 mt-1">
          {massBalanceResult.purifierBenefitPercent}%
        </div>
        <p className="text-[10px] text-slate-400 mt-0.5">particulate reduction</p>
      </div>

      <div>
        <span className="text-[11px] text-slate-400 uppercase font-mono">Time to 90% Cleanup</span>
        <div className="text-3xl font-black font-mono text-amber-300 mt-1">
          {massBalanceResult.timeTo90PercentCleanupMinutes ?? 'N/A'}{' '}
          <span className="text-xs font-normal text-slate-400">mins</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-0.5">to reach equilibrium</p>
      </div>
    </div>

    {/* Mathematical Formula Footnote */}
    <p className="text-[11px] text-slate-400 font-mono border-t border-white/5 pt-3">
      dC_in/dt = P·λ·C_out + (S/V) - [λ + k + (η·Q/V)] · C_in | Removal rate R = {massBalanceResult.totalRemovalRateACH} h⁻¹
    </p>
  </div>
);
