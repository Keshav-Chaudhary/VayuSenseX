import React from 'react';
import { TrendingDown, CheckCircle2 } from 'lucide-react';
import { TransportMode } from '../../domain/sustainability';

interface LifecycleComparisonTabProps {
  distanceKm: number;
  onDistanceChange: (v: number) => void;
  currentMode: TransportMode;
  onCurrentModeChange: (m: TransportMode) => void;
  alternativeMode: TransportMode;
  onAlternativeModeChange: (m: TransportMode) => void;
  daysPerWeek: number;
  onDaysPerWeekChange: (v: number) => void;
  emissionsComparison: {
    savingsGramsCO2ePerTrip: number;
    savingsKgCO2ePerYear: number;
    equivalentTreesPlanted: number;
  };
}

export const LifecycleComparisonTab: React.FC<LifecycleComparisonTabProps> = ({
  distanceKm,
  onDistanceChange,
  currentMode,
  onCurrentModeChange,
  alternativeMode,
  onAlternativeModeChange,
  daysPerWeek,
  onDaysPerWeekChange,
  emissionsComparison,
}) => (
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
    <div className="lg:col-span-5 glass-panel rounded-2xl p-6 border border-white/10 space-y-5 text-xs">
      <h3 className="text-base font-bold text-white pb-3 border-b border-white/10">
        Commute Parameters
      </h3>

      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-slate-300 font-medium">One-Way Commute Distance:</span>
          <span className="font-mono text-cyan-400 font-bold">{distanceKm} km</span>
        </div>
        <input
          type="range"
          min="2"
          max="60"
          value={distanceKm}
          onChange={(e) => onDistanceChange(Number(e.target.value))}
          className="w-full accent-cyan-400"
        />
      </div>

      <div>
        <label className="block text-slate-300 font-medium mb-1">Current Baseline Mode</label>
        <select
          value={currentMode}
          onChange={(e) => onCurrentModeChange(e.target.value as TransportMode)}
          className="w-full px-3 py-2 rounded-lg bg-midnight-950 border border-white/10 text-white"
        >
          <option value="PETROL_CAR">Petrol Car (Solo)</option>
          <option value="DIESEL_CAR">Diesel Car (Solo)</option>
          <option value="MOTORCYCLE">Motorcycle / Scooter</option>
          <option value="BUS">City Diesel Bus</option>
        </select>
      </div>

      <div>
        <label className="block text-slate-300 font-medium mb-1">Alternative Sustainable Mode</label>
        <select
          value={alternativeMode}
          onChange={(e) => onAlternativeModeChange(e.target.value as TransportMode)}
          className="w-full px-3 py-2 rounded-lg bg-midnight-950 border border-white/10 text-white"
        >
          <option value="METRO_RAIL">Rapid Metro Rail</option>
          <option value="EV_CAR">Electric Vehicle (Grid Charged)</option>
          <option value="CARPOOL">Carpool (Shared)</option>
          <option value="CYCLING">Bicycle</option>
          <option value="WALKING">Walking</option>
        </select>
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-slate-300 font-medium">Weekly Travel Days:</span>
          <span className="font-mono text-cyan-400 font-bold">{daysPerWeek} days/week</span>
        </div>
        <input
          type="range"
          min="1"
          max="7"
          value={daysPerWeek}
          onChange={(e) => onDaysPerWeekChange(Number(e.target.value))}
          className="w-full accent-cyan-400"
        />
      </div>
    </div>

    <div className="lg:col-span-7 glass-panel rounded-2xl p-6 border border-white/10 space-y-6">
      <h3 className="text-base font-bold text-white flex items-center space-x-2">
        <TrendingDown className="w-4 h-4 text-teal-400" />
        <span>Calculated Emission Savings</span>
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-midnight-900/60 border border-white/5">
          <span className="text-xs text-slate-400 block">Daily CO2e Avoided</span>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-2xl font-bold font-mono text-teal-300">
              {(emissionsComparison.savingsGramsCO2ePerTrip * 2 / 1000).toFixed(2)}
            </span>
            <span className="text-xs text-slate-400">kg CO2e</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-midnight-900/60 border border-white/5">
          <span className="text-xs text-slate-400 block">Annual Cumulative Offset</span>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-2xl font-bold font-mono text-emerald-300">
              {emissionsComparison.savingsKgCO2ePerYear}
            </span>
            <span className="text-xs text-slate-400">kg CO2e/year</span>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-teal-950/20 border border-teal-500/20 text-xs text-slate-300 space-y-2">
        <div className="flex items-center space-x-1.5 text-teal-300 font-bold">
          <CheckCircle2 className="w-4 h-4" />
          <span>Equivalent Real-World Environmental Impact:</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-400">
          Switching {distanceKm} km daily from {currentMode.replace(/_/g, ' ')} to {alternativeMode.replace(/_/g, ' ')} avoids approximately <strong className="text-white">{emissionsComparison.savingsKgCO2ePerYear} kg of greenhouse gases</strong> annually — equivalent to sequestering the carbon of <strong className="text-teal-300">{emissionsComparison.equivalentTreesPlanted} urban trees</strong>.
        </p>
      </div>
    </div>
  </div>
);
