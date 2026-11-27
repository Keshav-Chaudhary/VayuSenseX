import React, { useState, useMemo } from 'react';
import { Home } from 'lucide-react';
import { calculateRoomVolume, evaluateCADRSizing, solveIndoorMassBalance, estimateDIYBoxFanCADR, INDOOR_POLLUTION_SOURCES } from '../../domain/indoor';
import { MassBalancePanel } from './MassBalancePanel';
import { IndoorGuidanceCards } from './IndoorGuidanceCards';

interface IndoorWorkbenchProps {
  currentOutdoorPm25: number;
}

export const IndoorWorkbench: React.FC<IndoorWorkbenchProps> = ({ currentOutdoorPm25 }) => {
  // Dimensions state
  const [lengthM, setLengthM] = useState<number>(5.0);
  const [widthM, setWidthM] = useState<number>(4.0);
  const [heightM, setHeightM] = useState<number>(2.8);

  // Sizing target state
  const [targetACH, setTargetACH] = useState<number>(5.0);
  const [purifierCADR, setPurifierCADR] = useState<number>(280);

  // Mass balance parameters
  const [activeSources, setActiveSources] = useState<string[]>([]);
  const [airExchangeACH, setAirExchangeACH] = useState<number>(0.3); // sealed room baseline
  const [outdoorOverride, setOutdoorOverride] = useState<number | null>(null);
  const outdoorConcentration = outdoorOverride ?? currentOutdoorPm25;

  // Compute room volume
  const volumeM3 = useMemo(() => {
    return calculateRoomVolume({ lengthM, widthM, heightM });
  }, [lengthM, widthM, heightM]);

  // Compute CADR sizing assessment
  const sizingResult = useMemo(() => {
    return evaluateCADRSizing(volumeM3, purifierCADR, targetACH);
  }, [volumeM3, purifierCADR, targetACH]);

  // Total indoor generation rate from selected sources
  const totalIndoorGenRateUgH = useMemo(() => {
    return activeSources.reduce((acc, srcKey) => {
      const src = INDOOR_POLLUTION_SOURCES[srcKey];
      return acc + (src ? src.generationRateUgH : 0);
    }, 0);
  }, [activeSources]);

  // Solve ODE mass-balance
  const massBalanceResult = useMemo(() => {
    return solveIndoorMassBalance({
      roomVolumeM3: volumeM3,
      outdoorPm25UgM3: outdoorConcentration,
      penetrationFactor: 0.70,
      airExchangeRateACH: airExchangeACH,
      depositionRateACH: 0.20,
      purifierCADRM3H: purifierCADR,
      filterEfficiency: 0.99,
      indoorGenerationRateUgH: totalIndoorGenRateUgH,
      initialIndoorPm25UgM3: outdoorConcentration * 0.65,
    }, 2.0);
  }, [volumeM3, outdoorConcentration, airExchangeACH, purifierCADR, totalIndoorGenRateUgH]);

  // DIY Filter estimate
  const diyFilter = useMemo(() => estimateDIYBoxFanCADR(750, 'MERV13'), []);

  const toggleSource = (key: string) => {
    setActiveSources((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800/60 text-cyan-300 text-xs font-mono mb-2">
          <Home className="w-3.5 h-3.5 text-cyan-400" />
          <span>Home Air Quality Calculator</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Cleaner Indoor Air &amp; Purifier Guide
        </h1>
        <p className="text-slate-300 text-sm mt-1 max-w-3xl leading-relaxed">
          Enter your room size and purifier power to see how fast you can clean smoky indoor air, or check an affordable DIY box-fan filter setup.
        </p>
      </div>

      {/* Grid: Room Dimensions & Purifier Sizing */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Dimensions & Controls (5 Cols) */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-6 border border-white/10 space-y-5">
          <h2 className="text-base font-bold text-white flex items-center space-x-2 pb-3 border-b border-white/10">
            <span>1. Room Geometry & Purifier Capacity</span>
          </h2>

          {/* Dimension Inputs */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="indoor-length" className="text-xs font-mono text-slate-400">Length (m)</label>
              <input
                id="indoor-length"
                type="number"
                min="1"
                max="25"
                step="0.5"
                value={lengthM}
                onChange={(e) => setLengthM(parseFloat(e.target.value) || 1)}
                className="w-full mt-1 px-3 py-2 bg-midnight-900 border border-white/10 rounded-xl text-white font-mono text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="indoor-width" className="text-xs font-mono text-slate-400">Width (m)</label>
              <input
                id="indoor-width"
                type="number"
                min="1"
                max="25"
                step="0.5"
                value={widthM}
                onChange={(e) => setWidthM(parseFloat(e.target.value) || 1)}
                className="w-full mt-1 px-3 py-2 bg-midnight-900 border border-white/10 rounded-xl text-white font-mono text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="indoor-height" className="text-xs font-mono text-slate-400">Height (m)</label>
              <input
                id="indoor-height"
                type="number"
                min="2"
                max="6"
                step="0.1"
                value={heightM}
                onChange={(e) => setHeightM(parseFloat(e.target.value) || 2)}
                className="w-full mt-1 px-3 py-2 bg-midnight-900 border border-white/10 rounded-xl text-white font-mono text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Volume summary badge */}
          <div className="p-3 rounded-xl bg-midnight-900/80 border border-white/5 flex items-center justify-between text-xs">
            <span className="text-slate-400">Computed Room Volume (V):</span>
            <span className="font-mono font-bold text-cyan-300 text-sm">{volumeM3} m³</span>
          </div>

          {/* Purifier CADR Slider */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <label htmlFor="indoor-purifier-cadr" className="font-semibold text-slate-300">Clean Air Delivery Rate (CADR)</label>
              <span className="font-mono text-cyan-400 font-bold">{purifierCADR} m³/h</span>
            </div>
            <input
              id="indoor-purifier-cadr"
              type="range"
              min="0"
              max="650"
              step="10"
              value={purifierCADR}
              onChange={(e) => setPurifierCADR(parseInt(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
              <span>0 (No Purifier)</span>
              <span>250 (Bedroom)</span>
              <span>600+ (Living Room)</span>
            </div>
          </div>

          {/* Target ACH Toggle */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Smog Severity Target (Air Changes / Hr)
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setTargetACH(3.0)}
                className={`py-2 px-3 rounded-xl border text-center font-medium transition-all ${
                  targetACH === 3.0
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-bold'
                    : 'bg-midnight-900 border-white/5 text-slate-400'
                }`}
              >
                3.0 ACH (Baseline)
              </button>
              <button
                onClick={() => setTargetACH(5.0)}
                className={`py-2 px-3 rounded-xl border text-center font-medium transition-all ${
                  targetACH === 5.0
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-bold'
                    : 'bg-midnight-900 border-white/5 text-slate-400'
                }`}
              >
                5.0 ACH (Winter Smog Target)
              </button>
            </div>
          </div>

          {/* Sizing Evaluation Result */}
          <div className="p-4 rounded-xl bg-midnight-900/90 border border-white/10 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Required Clean Air Delivery:</span>
              <span className="font-mono font-bold text-white">{sizingResult.requiredCADRM3H} m³/h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Achieved Air Changes per Hour:</span>
              <span className="font-mono font-bold text-cyan-300">{sizingResult.achAchieved} ACH</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-white/5">
              <span className="text-slate-300 font-medium">Sizing Suitability:</span>
              <span className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                sizingResult.assessment === 'OPTIMAL' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                sizingResult.assessment === 'ACCEPTABLE' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                sizingResult.assessment === 'INSUFFICIENT' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                'bg-blue-950 text-blue-300 border border-blue-800'
              }`}>
                {sizingResult.assessment}
              </span>
            </div>
          </div>

        </div>

        {/* Dynamic Mass-Balance Output (7 Cols) */}
        <MassBalancePanel
          outdoorConcentration={outdoorConcentration}
          onOutdoorConcentrationChange={setOutdoorOverride}
          airExchangeACH={airExchangeACH}
          onAirExchangeACHChange={setAirExchangeACH}
          activeSources={activeSources}
          onToggleSource={toggleSource}
          massBalanceResult={massBalanceResult}
        />

      </div>

      {/* Secondary Row: DIY Corsi-Rosenthal Box-Fan & Houseplant Myth Correction */}
      <IndoorGuidanceCards diyFilter={diyFilter} />

    </div>
  );
};
