import React, { useState, useMemo } from 'react';
import { Home, Cpu, AlertTriangle } from 'lucide-react';
import { calculateRoomVolume, evaluateCADRSizing, solveIndoorMassBalance, estimateDIYBoxFanCADR, INDOOR_POLLUTION_SOURCES, HOUSEPLANT_MYTH_GUIDANCE } from '../../domain/indoor';

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
  const [outdoorConcentration, setOutdoorConcentration] = useState<number>(currentOutdoorPm25);

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
          <span>Module E Deterministic Engine</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Indoor Air Quality & Mechanical Filtration Workbench
        </h1>
        <p className="text-slate-300 text-sm mt-1 max-w-3xl leading-relaxed">
          Simulate particle penetration, calculate room-specific CADR air changes, evaluate DIY box-fan filtration, and solve single-zone indoor mass-balance differential equations.
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
              <label className="text-xs font-mono text-slate-400">Length (m)</label>
              <input
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
              <label className="text-xs font-mono text-slate-400">Width (m)</label>
              <input
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
              <label className="text-xs font-mono text-slate-400">Height (m)</label>
              <input
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
              <span className="font-semibold text-slate-300">Clean Air Delivery Rate (CADR)</span>
              <span className="font-mono text-cyan-400 font-bold">{purifierCADR} m³/h</span>
            </div>
            <input
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
        <div className="lg:col-span-7 glass-panel rounded-2xl p-6 border border-white/10 flex flex-col justify-between space-y-6">
          <div>
            <h2 className="text-base font-bold text-white flex items-center justify-between pb-3 border-b border-white/10">
              <span>2. Single-Zone Mass-Balance Differential Solution</span>
              <span className="text-xs font-mono text-cyan-400">Analytical ODE Solver</span>
            </h2>

            {/* Microenvironment inputs: Outdoor & Sources */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">
                  Outdoor PM2.5 Concentration (C_out)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="10"
                    max="500"
                    value={outdoorConcentration}
                    onChange={(e) => setOutdoorConcentration(parseInt(e.target.value))}
                    className="flex-1 accent-cyan-500 cursor-pointer"
                  />
                  <span className="font-mono font-bold text-xs text-cyan-300 w-16 text-right">
                    {outdoorConcentration} µg/m³
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">
                  Envelope Ventilation Rate (λ)
                </label>
                <select
                  value={airExchangeACH}
                  onChange={(e) => setAirExchangeACH(parseFloat(e.target.value))}
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
                      onClick={() => toggleSource(key)}
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

      </div>

      {/* Secondary Row: DIY Corsi-Rosenthal Box-Fan & Houseplant Myth Correction */}
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

    </div>
  );
};
