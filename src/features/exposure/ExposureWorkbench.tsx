import React, { useState, useMemo } from 'react';
import { Activity } from 'lucide-react';
import { calculateInhaledExposure, DemographyGroup, ActivityInterval, BASELINE_UNMITIGATED_ROUTINE, OPTIMIZED_VAYUSENSEX_ROUTINE } from '../../domain/exposure';

interface ExposureWorkbenchProps {
  currentOutdoorPm25: number;
}

export const ExposureWorkbench: React.FC<ExposureWorkbenchProps> = ({ currentOutdoorPm25 }) => {
  const [demographic, setDemographic] = useState<DemographyGroup>('ADULT');
  const [activePreset, setActivePreset] = useState<'BASELINE' | 'OPTIMIZED'>('BASELINE');

  const intervals: ActivityInterval[] = useMemo(() => {
    return activePreset === 'BASELINE' ? BASELINE_UNMITIGATED_ROUTINE : OPTIMIZED_VAYUSENSEX_ROUTINE;
  }, [activePreset]);

  // Compute exposure using deterministic EPA engine
  const exposureSummary = useMemo(() => {
    return calculateInhaledExposure(intervals, demographic, currentOutdoorPm25);
  }, [intervals, demographic, currentOutdoorPm25]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800/60 text-cyan-300 text-xs font-mono mb-2">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>Daily Breathing Exposure Check</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          How Much Pollution Do You Breathe in a Day?
        </h1>
        <p className="text-slate-300 text-sm mt-1 max-w-3xl leading-relaxed">
          Compare everyday routines—like morning jogs vs. cleaner afternoon walks—to see how much smoke and dust reaches your lungs across home, commute, and outdoor time.
        </p>
      </div>

      {/* Control Bar: Demographic & Routine Preset */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl glass-panel border border-white/10">
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Household Profile / Demographic Sensitivity:
          </label>
          <div className="flex flex-wrap gap-2 text-xs">
            {(['ADULT', 'CHILD', 'ELDERLY', 'PREGNANT', 'RESPIRATORY_SENSITIVE'] as DemographyGroup[]).map((grp) => (
              <button
                key={grp}
                aria-pressed={demographic === grp}
                onClick={() => setDemographic(grp)}
                className={`px-3 py-1.5 rounded-xl border font-medium transition-all ${
                  demographic === grp
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
                    : 'bg-midnight-900 border-white/5 text-slate-400 hover:text-slate-200'
                }`}
              >
                {grp.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Daily Activity Schedule Preset:
          </label>
          <div className="flex items-center bg-midnight-900 p-1 rounded-xl border border-white/10 text-xs">
            <button
              aria-pressed={activePreset === 'BASELINE'}
              onClick={() => setActivePreset('BASELINE')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activePreset === 'BASELINE'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Unmitigated Routine
            </button>
            <button
              aria-pressed={activePreset === 'OPTIMIZED'}
              onClick={() => setActivePreset('OPTIMIZED')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activePreset === 'OPTIMIZED'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              VayuSenseX Cleanest Window
            </button>
          </div>
        </div>
      </div>

      {/* Main Exposure Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl glass-panel border border-white/10">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Total Inhaled Dose (D)</span>
          <div className="text-3xl font-black font-mono text-white mt-1">
            {exposureSummary.totalInhaledDoseUg.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-400">µg</span>
          </div>
          <span className="text-xs text-cyan-300 mt-1 block">
            Over {exposureSummary.totalDurationHours} hours
          </span>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/10">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Indoor Inhaled Intake</span>
          <div className="text-3xl font-black font-mono text-emerald-400 mt-1">
            {exposureSummary.indoorDoseUg.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-400">µg</span>
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            {Math.round((exposureSummary.indoorDoseUg / Math.max(1, exposureSummary.totalInhaledDoseUg)) * 100)}% of total dose
          </span>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/10">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Outdoor Exertion Intake</span>
          <div className="text-3xl font-black font-mono text-rose-400 mt-1">
            {exposureSummary.outdoorDoseUg.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-400">µg</span>
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            {Math.round((exposureSummary.outdoorDoseUg / Math.max(1, exposureSummary.totalInhaledDoseUg)) * 100)}% of total dose
          </span>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/10">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Transit Corridor Intake</span>
          <div className="text-3xl font-black font-mono text-amber-300 mt-1">
            {exposureSummary.transitDoseUg.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-400">µg</span>
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            Roadside commuting share
          </span>
        </div>

      </div>

      {/* Interval by Interval Breakdown */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10">
        <h2 className="text-base font-bold text-white mb-4">Daily Schedule Microenvironment Breakdown</h2>
        
        <div className="space-y-3">
          {exposureSummary.segments.map((seg) => (
            <div
              key={seg.activityId}
              className="p-4 rounded-xl bg-midnight-900/70 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-0.5">
                <span className="font-bold text-white text-sm">{seg.activityLabel}</span>
                <div className="flex items-center space-x-3 text-slate-400 font-mono text-[11px]">
                  <span>Environment: {seg.environment}</span>
                  <span>•</span>
                  <span>Breathing Rate: {seg.breathingRateM3H} m³/h</span>
                  <span>•</span>
                  <span>Duration: {seg.durationHours * 60} mins</span>
                </div>
              </div>

              <div className="flex items-center space-x-6 sm:text-right font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">MICROENV PM2.5</span>
                  <span className="text-white font-bold">{seg.concentrationUgM3} µg/m³</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">INHALED DOSE</span>
                  <span className="text-cyan-300 font-bold text-sm">{seg.inhaledDoseUg} µg</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <p className="mt-6 text-[11px] text-slate-400 border-t border-white/5 pt-3 leading-relaxed">
          <strong>Scientific Attribution:</strong> {exposureSummary.scientificDisclaimer}
        </p>
      </div>

    </div>
  );
};
