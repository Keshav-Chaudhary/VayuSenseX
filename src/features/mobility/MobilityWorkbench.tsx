import React, { useState, useMemo } from 'react';
import { TreePine, Leaf, ArrowRight } from 'lucide-react';
import { compareTransportEmissions, TRANSPORT_EMISSION_FACTORS, TransportMode } from '../../domain/sustainability';

export const MobilityWorkbench: React.FC = () => {
  const [distanceKm, setDistanceKm] = useState<number>(16);
  const [currentMode, setCurrentMode] = useState<TransportMode>('PETROL_CAR');
  const [alternativeMode, setAlternativeMode] = useState<TransportMode>('METRO_RAIL');
  const [daysPerWeek, setDaysPerWeek] = useState<number>(5);

  const comparison = useMemo(() => {
    return compareTransportEmissions(distanceKm, currentMode, alternativeMode, daysPerWeek);
  }, [distanceKm, currentMode, alternativeMode, daysPerWeek]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800/60 text-cyan-300 text-xs font-mono mb-2">
          <Leaf className="w-3.5 h-3.5 text-cyan-400" />
          <span>Module H Deterministic Engine</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Sustainable Mobility & Carbon Offset Calculator
        </h1>
        <p className="text-slate-300 text-sm mt-1 max-w-3xl leading-relaxed">
          Quantify direct tailpipe and lifecycle greenhouse gas offsets ($CO_2e$) when switching urban commuting modes based on India GHG Protocol and CEA grid intensity benchmarks.
        </p>
      </div>

      {/* Main Interactive Controls & Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Controls Card (5 Cols) */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-6 border border-white/10 space-y-5">
          <h2 className="text-base font-bold text-white pb-3 border-b border-white/10">
            Commute Parameters
          </h2>

          {/* Distance Slider */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-semibold text-slate-300">One-Way Commute Distance:</span>
              <span className="font-mono text-cyan-400 font-bold">{distanceKm} km</span>
            </div>
            <input
              type="range"
              min="2"
              max="60"
              value={distanceKm}
              onChange={(e) => setDistanceKm(parseInt(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
              <span>2 km (Local)</span>
              <span>25 km (Suburban)</span>
              <span>60 km (Regional)</span>
            </div>
          </div>

          {/* Frequency */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-semibold text-slate-300">Frequency (Days / Week):</span>
              <span className="font-mono text-cyan-400 font-bold">{daysPerWeek} days</span>
            </div>
            <input
              type="range"
              min="1"
              max="7"
              value={daysPerWeek}
              onChange={(e) => setDaysPerWeek(parseInt(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          {/* Current Mode Selection */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Current Commute Mode:
            </label>
            <select
              value={currentMode}
              onChange={(e) => setCurrentMode(e.target.value as TransportMode)}
              className="w-full px-3 py-2 bg-midnight-900 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none"
            >
              {Object.entries(TRANSPORT_EMISSION_FACTORS).map(([key, f]) => (
                <option key={key} value={key}>
                  {f.label} ({f.lifecycleGramsCO2ePerKm} g CO₂e/km)
                </option>
              ))}
            </select>
          </div>

          {/* Alternative Mode Selection */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Alternative Sustainable Mode:
            </label>
            <select
              value={alternativeMode}
              onChange={(e) => setAlternativeMode(e.target.value as TransportMode)}
              className="w-full px-3 py-2 bg-midnight-900 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none"
            >
              {Object.entries(TRANSPORT_EMISSION_FACTORS).map(([key, f]) => (
                <option key={key} value={key}>
                  {f.label} ({f.lifecycleGramsCO2ePerKm} g CO₂e/km)
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Quantified Impact Cards (7 Cols) */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-6 border border-white/10 flex flex-col justify-between space-y-6">
          <div>
            <h2 className="text-base font-bold text-white flex items-center justify-between pb-3 border-b border-white/10">
              <span>Modelled Carbon Offsets & Equivalents</span>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                {comparison.percentReduction}% Emission Reduction
              </span>
            </h2>

            {/* Visual Mode Comparison Card */}
            <div className="mt-4 p-4 rounded-xl bg-midnight-900/80 border border-white/5 flex items-center justify-between text-xs font-mono">
              <div>
                <span className="text-slate-500 block text-[10px]">CURRENT EMISSION / TRIP</span>
                <span className="text-rose-300 font-bold text-lg">{comparison.currentTripCO2eGrams} g CO₂e</span>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-500" />
              <div className="text-right">
                <span className="text-slate-500 block text-[10px]">ALTERNATIVE / TRIP</span>
                <span className="text-emerald-300 font-bold text-lg">{comparison.alternativeTripCO2eGrams} g CO₂e</span>
              </div>
            </div>
          </div>

          {/* Annual & Monthly Impact Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-midnight-900/90 border border-white/10">
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-mono">Per Trip Savings</span>
              <div className="text-3xl font-black font-mono text-cyan-300 mt-1">
                {comparison.savingsGramsCO2ePerTrip}{' '}
                <span className="text-xs font-normal text-slate-400">g CO₂e</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">per one-way journey</p>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 uppercase font-mono">Annual Carbon Avoided</span>
              <div className="text-3xl font-black font-mono text-emerald-400 mt-1">
                {comparison.savingsKgCO2ePerYear}{' '}
                <span className="text-xs font-normal text-slate-400">kg CO₂e</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">cumulative offset</p>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 uppercase font-mono">Urban Tree Equivalent</span>
              <div className="text-3xl font-black font-mono text-teal-300 mt-1 flex items-baseline space-x-1">
                <span>{comparison.equivalentTreesPlanted}</span>
                <TreePine className="w-5 h-5 text-emerald-400 inline ml-1" />
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">trees sequestering CO₂/yr</p>
            </div>
          </div>

          {/* Factor Attribution Note */}
          <p className="text-[11px] text-slate-400 leading-normal border-t border-white/5 pt-3">
            <strong>System Boundary:</strong> {comparison.boundaryNote}
          </p>
        </div>

      </div>

    </div>
  );
};
