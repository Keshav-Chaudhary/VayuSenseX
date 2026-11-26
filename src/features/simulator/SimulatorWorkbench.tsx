import React, { useState, useMemo } from 'react';
import { Sliders } from 'lucide-react';
import { runScenarioComparison, HouseholdScenarioConfig } from '../../domain/scenarios';
import { TransportMode } from '../../domain/sustainability';
import { SimulationOutcomeDeck } from './SimulationOutcomeDeck';

interface SimulatorWorkbenchProps {
  currentOutdoorPm25: number;
}

export const SimulatorWorkbench: React.FC<SimulatorWorkbenchProps> = ({ currentOutdoorPm25 }) => {
  // Baseline configuration
  const [baselinePurifier, setBaselinePurifier] = useState<boolean>(false);
  const [baselineCADR, setBaselineCADR] = useState<number>(0);
  const [baselineExercise, setBaselineExercise] = useState<HouseholdScenarioConfig['outdoorExerciseTiming']>('MORNING_PEAK_SMOG');
  const [baselineCommute, setBaselineCommute] = useState<TransportMode>('PETROL_CAR');
  const [baselineSources, setBaselineSources] = useState<boolean>(true); // incense active

  // Alternative configuration
  const [altPurifier, setAltPurifier] = useState<boolean>(true);
  const [altCADR] = useState<number>(320);
  const [altExercise, setAltExercise] = useState<HouseholdScenarioConfig['outdoorExerciseTiming']>('INDOOR_FILTERED');
  const [altCommute, setAltCommute] = useState<TransportMode>('METRO_RAIL');
  const [altSources, setAltSources] = useState<boolean>(false); // clean aromatics

  const baselineConfig: HouseholdScenarioConfig = useMemo(() => ({
    scenarioName: 'Baseline Routine',
    hasPurifier: baselinePurifier,
    purifierCADRM3H: baselineCADR,
    outdoorExerciseTiming: baselineExercise,
    commuteMode: baselineCommute,
    commuteDistanceKm: 16,
    indoorSourcesActive: baselineSources,
    outdoorPm25UgM3: currentOutdoorPm25,
    roomVolumeM3: 48,
  }), [baselinePurifier, baselineCADR, baselineExercise, baselineCommute, baselineSources, currentOutdoorPm25]);

  const altConfig: HouseholdScenarioConfig = useMemo(() => ({
    scenarioName: 'Optimized Routine',
    hasPurifier: altPurifier,
    purifierCADRM3H: altCADR,
    outdoorExerciseTiming: altExercise,
    commuteMode: altCommute,
    commuteDistanceKm: 16,
    indoorSourcesActive: altSources,
    outdoorPm25UgM3: currentOutdoorPm25,
    roomVolumeM3: 48,
  }), [altPurifier, altCADR, altExercise, altCommute, altSources, currentOutdoorPm25]);

  const report = useMemo(() => {
    return runScenarioComparison(baselineConfig, altConfig);
  }, [baselineConfig, altConfig]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800/60 text-cyan-300 text-xs font-mono mb-2">
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span>Module I Flagship Differentiator</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          What-If Household Environmental Scenario Simulator
        </h1>
        <p className="text-slate-300 text-sm mt-1 max-w-3xl leading-relaxed">
          Simulate changes to your family's daily habits. Compare the combined effect of bedroom filtration, workout timing, commute mode shifts, and indoor combustion elimination.
        </p>
      </div>

      {/* Side-by-side Configuration Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Baseline Scenario Card */}
        <div className="glass-panel rounded-2xl p-6 border border-rose-500/20 bg-midnight-900/50 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h2 className="text-base font-bold text-rose-300 flex items-center space-x-2">
              <span>Scenario A: Baseline Routine</span>
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-300">
              Unmitigated
            </span>
          </div>

          {/* Purifier Toggle */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300">Bedroom Air Purifier:</span>
            <button
              onClick={() => {
                setBaselinePurifier(!baselinePurifier);
                if (!baselinePurifier && baselineCADR === 0) setBaselineCADR(250);
              }}
              className={`px-3 py-1 rounded-lg border font-mono font-medium ${
                baselinePurifier ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'bg-midnight-950 border-white/10 text-slate-400'
              }`}
            >
              {baselinePurifier ? 'Active' : 'Off / None'}
            </button>
          </div>

          {/* Exercise Timing */}
          <div className="space-y-1">
            <label className="text-xs text-slate-400">Exercise Timing & Location:</label>
            <select
              value={baselineExercise}
              onChange={(e) => setBaselineExercise(e.target.value as HouseholdScenarioConfig['outdoorExerciseTiming'])}
              className="w-full px-3 py-1.5 bg-midnight-950 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none"
            >
              <option value="MORNING_PEAK_SMOG">Morning Outdoor Exercise (7:00 AM Inversion Peak)</option>
              <option value="MIDDAY_CLEANEST_WINDOW">Midday Outdoor Exercise (Cleanest Window)</option>
              <option value="INDOOR_FILTERED">Indoor Workout in Purified Room</option>
            </select>
          </div>

          {/* Commute Mode */}
          <div className="space-y-1">
            <label className="text-xs text-slate-400">Commute Mode (16 km round-trip):</label>
            <select
              value={baselineCommute}
              onChange={(e) => setBaselineCommute(e.target.value as TransportMode)}
              className="w-full px-3 py-1.5 bg-midnight-950 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none"
            >
              <option value="PETROL_CAR">Petrol Car (Single Occupancy)</option>
              <option value="DIESEL_CAR">Diesel Car (Single Occupancy)</option>
              <option value="MOTORCYCLE">Two-Wheeler (Motorcycle)</option>
              <option value="BUS">Public City Bus</option>
              <option value="METRO_RAIL">Electric Metro Transit</option>
            </select>
          </div>

          {/* Combustion Sources */}
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-300">Indoor Incense / Coils:</span>
            <button
              onClick={() => setBaselineSources(!baselineSources)}
              className={`px-3 py-1 rounded-lg border font-mono font-medium ${
                baselineSources ? 'bg-rose-950 border-rose-700 text-rose-300' : 'bg-midnight-950 border-white/10 text-slate-400'
              }`}
            >
              {baselineSources ? 'Yes (Combustion)' : 'None'}
            </button>
          </div>
        </div>

        {/* Alternative Scenario Card */}
        <div className="glass-panel rounded-2xl p-6 border border-emerald-500/30 bg-midnight-900/50 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h2 className="text-base font-bold text-emerald-300 flex items-center space-x-2">
              <span>Scenario B: Optimized Routine</span>
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300">
              VayuSenseX Protected
            </span>
          </div>

          {/* Purifier Toggle & Slider */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300">Bedroom Air Purifier:</span>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-cyan-300 text-xs">{altCADR} m³/h</span>
              <button
                onClick={() => setAltPurifier(!altPurifier)}
                className={`px-3 py-1 rounded-lg border font-mono font-medium ${
                  altPurifier ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' : 'bg-midnight-950 border-white/10 text-slate-400'
                }`}
              >
                {altPurifier ? 'Active' : 'Off'}
              </button>
            </div>
          </div>

          {/* Exercise Timing */}
          <div className="space-y-1">
            <label className="text-xs text-slate-400">Exercise Timing & Location:</label>
            <select
              value={altExercise}
              onChange={(e) => setAltExercise(e.target.value as HouseholdScenarioConfig['outdoorExerciseTiming'])}
              className="w-full px-3 py-1.5 bg-midnight-950 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none"
            >
              <option value="INDOOR_FILTERED">Indoor Workout in Purified Room</option>
              <option value="MIDDAY_CLEANEST_WINDOW">Midday Outdoor Exercise (Cleanest Window)</option>
              <option value="MORNING_PEAK_SMOG">Morning Outdoor Exercise (7:00 AM Inversion Peak)</option>
            </select>
          </div>

          {/* Commute Mode */}
          <div className="space-y-1">
            <label className="text-xs text-slate-400">Commute Mode (16 km round-trip):</label>
            <select
              value={altCommute}
              onChange={(e) => setAltCommute(e.target.value as TransportMode)}
              className="w-full px-3 py-1.5 bg-midnight-950 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none"
            >
              <option value="METRO_RAIL">Electric Metro Transit (Cleanest Transit)</option>
              <option value="BUS">Public City Bus</option>
              <option value="CARPOOL">Carpooling (3+ Passengers)</option>
              <option value="EV_CAR">Electric Car (EV)</option>
              <option value="PETROL_CAR">Petrol Car</option>
            </select>
          </div>

          {/* Combustion Sources */}
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-300">Indoor Incense / Coils:</span>
            <button
              onClick={() => setAltSources(!altSources)}
              className={`px-3 py-1 rounded-lg border font-mono font-medium ${
                altSources ? 'bg-rose-950 border-rose-700 text-rose-300' : 'bg-emerald-950 border-emerald-700 text-emerald-300'
              }`}
            >
              {altSources ? 'Yes (Combustion)' : 'Zero Combustion (Flameless)'}
            </button>
          </div>
        </div>

      </div>

      {/* Quantified Comparative Impact Deck */}
      <SimulationOutcomeDeck report={report} />

    </div>
  );
};
