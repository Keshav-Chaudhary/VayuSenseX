import React, { useState, useMemo } from 'react';
import { 
  CalendarCheck, ShieldAlert, ArrowRight, CheckCircle2, 
  Clock, TrendingDown, Info, Sparkles, Filter 
} from 'lucide-react';
import { HouseholdProfile } from '../../domain/household/types';
import { HourlyForecastPoint } from '../../services/environment/types';
import { generateDailyHouseholdPlan } from '../../domain/planner/schedule-optimizer';
import { ActionRecommendation, ActionStatus } from '../../domain/planner/planner-types';

interface PlannerWorkbenchProps {
  profile: HouseholdProfile;
  hourlyForecast: HourlyForecastPoint[];
  currentOutdoorPm25: number;
}

export const PlannerWorkbench: React.FC<PlannerWorkbenchProps> = ({
  profile,
  hourlyForecast,
  currentOutdoorPm25,
}) => {
  // Generate synthetic hourly forecast if empty (e.g. offline sample data)
  const activeForecast = useMemo<HourlyForecastPoint[]>(() => {
    if (hourlyForecast.length >= 24) return hourlyForecast;
    
    // Deterministic 24-hr diurnal smog pattern based on current outdoor PM2.5
    const base = currentOutdoorPm25;
    const now = new Date();
    return Array.from({ length: 24 }).map((_, i) => {
      const d = new Date(now);
      d.setHours(i, 0, 0, 0);
      // Diurnal curve: peak at 07:00-09:00 (inversion + morning traffic), valley at 14:00-16:00
      let multiplier = 1.0;
      if (i >= 6 && i <= 9) multiplier = 1.7; // Morning smog peak
      else if (i >= 13 && i <= 16) multiplier = 0.55; // Afternoon thermal boundary layer expansion
      else if (i >= 20 && i <= 23) multiplier = 1.35; // Night cooling compression
      
      const pm25 = Math.round(base * multiplier);
      return {
        timestamp: d.toISOString(),
        hourLabel: `${String(i).padStart(2, '0')}:00`,
        pm25,
        pm10: pm25 * 1.6,
        temperature: 22 - (i >= 12 && i <= 16 ? -6 : Math.abs(i - 14) * 0.5),
        relativeHumidity: 65,
        windSpeed: i >= 13 && i <= 16 ? 12 : 4,
        cpcbAqi: Math.min(500, Math.round(pm25 * 1.3)),
        usepaAqi: Math.min(500, Math.round(pm25 * 1.1)),
      };
    });
  }, [hourlyForecast, currentOutdoorPm25]);

  // Compute daily household plan
  const plan = useMemo(() => {
    return generateDailyHouseholdPlan(profile, activeForecast, currentOutdoorPm25);
  }, [profile, activeForecast, currentOutdoorPm25]);

  // Local state for interactive action status overrides
  const [actionStatuses, setActionStatuses] = useState<Record<string, ActionStatus>>({});
  const [expandedRationale, setExpandedRationale] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const handleStatusChange = (actionId: string, status: ActionStatus) => {
    setActionStatuses(prev => ({ ...prev, [actionId]: status }));
  };

  const filteredRecommendations = useMemo(() => {
    if (filterCategory === 'ALL') return plan.recommendations;
    return plan.recommendations.filter(r => r.category === filterCategory);
  }, [plan.recommendations, filterCategory]);

  const completedCount = useMemo(() => {
    return plan.recommendations.filter(r => (actionStatuses[r.id] ?? r.status) === 'COMPLETED').length;
  }, [plan.recommendations, actionStatuses]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 relative overflow-hidden bg-gradient-to-r from-midnight-900 via-midnight-950 to-midnight-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Evidence-Grounded Routine Optimization</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {plan.overallStrategy}
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-3xl">
              Optimized for {profile.name} in {plan.cityName} • Minimizing nocturnal boundary-layer inversion exposure
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-midnight-900/80 p-3 rounded-xl border border-white/10 shrink-0">
            <CalendarCheck className="w-5 h-5 text-teal-400" />
            <div>
              <span className="block text-xs text-slate-400">Plan Execution</span>
              <span className="font-mono text-sm font-bold text-white">
                {completedCount} of {plan.recommendations.length} Actions Done
              </span>
            </div>
          </div>
        </div>

        {/* High-Level Impact Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="p-4 rounded-xl bg-midnight-900/60 border border-white/5">
            <span className="text-xs text-slate-400 block">Peak Inversion Risk Window</span>
            <div className="flex items-center space-x-2 mt-1">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span className="text-base font-bold text-rose-300 font-mono">
                {plan.peakPollutionPeriod}
              </span>
            </div>
            <span className="text-[11px] text-slate-500">
              Boundary-layer compression peak
            </span>
          </div>

          <div className="p-4 rounded-xl bg-midnight-900/60 border border-white/5">
            <span className="text-xs text-slate-400 block">Optimal Ventilation & Exercise</span>
            <div className="flex items-center space-x-2 mt-1">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span className="text-base font-bold text-emerald-300 font-mono">
                {plan.cleanestAvailablePeriod}
              </span>
            </div>
            <span className="text-[11px] text-slate-500">
              Midday solar dispersion window
            </span>
          </div>

          <div className="p-4 rounded-xl bg-midnight-900/60 border border-white/5">
            <span className="text-xs text-slate-400 block">Baseline Inhaled Dose (Unmanaged)</span>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-lg font-bold text-amber-300 font-mono">
                {plan.totalDoseBeforeUg.toFixed(1)}
              </span>
              <span className="text-xs text-slate-400">µg PM2.5</span>
            </div>
            <span className="text-[11px] text-slate-500">Standard daily routine baseline</span>
          </div>

          <div className="p-4 rounded-xl bg-midnight-900/60 border border-white/5">
            <span className="text-xs text-slate-400 block">Optimized Inhaled Dose</span>
            <div className="flex items-center space-x-2 mt-1">
              <TrendingDown className="w-4 h-4 text-teal-400" />
              <span className="text-lg font-bold text-teal-300 font-mono">
                {plan.totalDoseAfterUg.toFixed(1)}
              </span>
              <span className="text-xs text-teal-400 font-bold">
                (-{plan.netDoseReductionPercent.toFixed(1)}%)
              </span>
            </div>
            <span className="text-[11px] text-teal-400 font-medium">
              Avoids {(plan.totalDoseBeforeUg - plan.totalDoseAfterUg).toFixed(1)} µg particulate
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Action Recommendations + Optimized Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Actionable Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <CalendarCheck className="w-5 h-5 text-cyan-400" />
                <span>Prescribed Action Interventions</span>
              </h2>
              <p className="text-xs text-slate-400">
                Sorted by physiological urgency and atmospheric timing
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-1 bg-midnight-900 border border-white/10 rounded-lg p-1 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400 ml-1 mr-1" />
              {(['ALL', 'OUTDOOR_TIMING', 'INDOOR_PURIFICATION', 'TRANSIT_SHIFT', 'SOURCE_MITIGATION'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    filterCategory === cat
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cat === 'ALL' ? 'All' : cat === 'OUTDOOR_TIMING' ? 'Timing' : cat === 'INDOOR_PURIFICATION' ? 'Filtration' : cat === 'TRANSIT_SHIFT' ? 'Transit' : 'Sources'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredRecommendations.map((rec: ActionRecommendation) => {
              const currentStatus = actionStatuses[rec.id] ?? rec.status;
              const isExpanded = expandedRationale === rec.id;

              return (
                <div
                  key={rec.id}
                  className={`glass-card p-5 rounded-2xl border transition-all ${
                    currentStatus === 'COMPLETED'
                      ? 'border-teal-500/30 bg-teal-950/20'
                      : currentStatus === 'SKIPPED'
                      ? 'border-white/5 bg-midnight-950/40 opacity-60'
                      : 'border-white/10 bg-midnight-900/60 hover:border-cyan-500/30'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                          rec.priority === 'HIGH'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : rec.priority === 'MEDIUM'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        }`}>
                          {rec.priority}
                        </span>

                        <span className="text-[11px] font-mono text-slate-400">
                          {rec.category.replace(/_/g, ' ')}
                        </span>

                        {rec.originalTimeLabel && rec.suggestedTimeLabel && (
                          <span className="text-[11px] text-cyan-300 font-mono">
                            • {rec.originalTimeLabel} → {rec.suggestedTimeLabel}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-white">
                        {rec.title}
                      </h3>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {rec.actionText}
                      </p>

                      {/* Quantitative Impact Metric */}
                      <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg bg-midnight-950/80 border border-white/5 text-xs">
                        <span className="text-slate-400">Estimated Dose Reduction:</span>
                        <span className="font-mono font-bold text-teal-400">
                          {rec.estimatedDoseReductionUg.toFixed(1)} µg PM2.5
                        </span>
                        {rec.estimatedCO2eReductionGrams !== undefined && rec.estimatedCO2eReductionGrams > 0 && (
                          <span className="font-mono text-emerald-400 text-[11px]">
                            • {rec.estimatedCO2eReductionGrams}g CO2e saved
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Interactive Status Controls */}
                    <div className="flex sm:flex-col items-end gap-2 shrink-0">
                      <div className="flex items-center space-x-1 bg-midnight-950 rounded-lg p-1 border border-white/10 text-xs">
                        <button
                          onClick={() => handleStatusChange(rec.id, 'PLANNED')}
                          className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                            currentStatus === 'PLANNED'
                              ? 'bg-cyan-500 text-midnight-950 font-bold'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Planned
                        </button>
                        <button
                          onClick={() => handleStatusChange(rec.id, 'COMPLETED')}
                          className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                            currentStatus === 'COMPLETED'
                              ? 'bg-teal-500 text-midnight-950 font-bold'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Done
                        </button>
                        <button
                          onClick={() => handleStatusChange(rec.id, 'SKIPPED')}
                          className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                            currentStatus === 'SKIPPED'
                              ? 'bg-slate-700 text-white font-bold'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Skip
                        </button>
                      </div>

                      <button
                        onClick={() => setExpandedRationale(isExpanded ? null : rec.id)}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 mt-1"
                      >
                        <Info className="w-3.5 h-3.5" />
                        <span>{isExpanded ? 'Hide Science' : 'Scientific Rationale'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Scientific Rationale Accordion */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-white/10 bg-midnight-950/60 p-3.5 rounded-xl text-xs space-y-2 animate-fade-in">
                      <div className="flex items-center space-x-1.5 text-cyan-300 font-bold">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Atmospheric & Physiological Rationale:</span>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        {rec.rationale}
                      </p>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Citing Fact IDs: {rec.supportingFactIds.join(', ')}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Optimized Hourly Timeline */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Clock className="w-5 h-5 text-teal-400" />
              <span>Optimized Daily Routine</span>
            </h2>
            <p className="text-xs text-slate-400">
              Shifted away from nocturnal thermal inversions
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-midnight-900/60 space-y-3">
            {plan.scheduleItems.map((slot) => (
              <div
                key={slot.activityId}
                className={`p-3.5 rounded-xl border text-xs transition-all ${
                  slot.isModified
                    ? 'border-cyan-500/40 bg-cyan-950/20'
                    : 'border-white/5 bg-midnight-950/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{slot.label}</span>
                  {slot.isModified ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      Rescheduled
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500">Unchanged</span>
                  )}
                </div>

                <div className="flex items-center space-x-2 mt-2">
                  <span className="font-mono text-slate-400">
                    {String(slot.originalStartHour).padStart(2, '0')}:{String(slot.originalStartMinute).padStart(2, '0')}
                  </span>
                  {slot.isModified && (
                    <>
                      <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="font-mono font-bold text-cyan-300">
                        {String(slot.suggestedStartHour).padStart(2, '0')}:{String(slot.suggestedStartMinute).padStart(2, '0')}
                      </span>
                    </>
                  )}
                  <span className="text-slate-500 font-mono">({slot.durationMinutes} min)</span>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[11px]">
                  <span className="text-slate-400">
                    Inhaled Dose:
                  </span>
                  <div className="flex items-center space-x-1.5">
                    {slot.isModified && (
                      <span className="line-through text-rose-400/80 font-mono">
                        {slot.estimatedDoseBeforeUg.toFixed(1)}
                      </span>
                    )}
                    <span className="font-mono font-bold text-teal-300">
                      {slot.estimatedDoseAfterUg.toFixed(1)} µg
                    </span>
                    {slot.doseReductionPercent > 0 && (
                      <span className="text-teal-400 font-bold">
                        (-{slot.doseReductionPercent.toFixed(0)}%)
                      </span>
                    )}
                  </div>
                </div>

                {slot.modificationReason && (
                  <p className="text-[10px] text-cyan-300/80 mt-1.5 leading-snug">
                    {slot.modificationReason}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Quick Tip Card */}
          <div className="p-4 rounded-xl bg-teal-950/30 border border-teal-500/20 text-xs space-y-2">
            <div className="flex items-center space-x-2 text-teal-300 font-bold">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              <span>Smart Shift Rule of Thumb</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Shifting outdoor activities between 12:00 PM and 3:30 PM harnesses midday solar convection, when the planetary boundary layer expands and disperses surface particulates by up to 55%.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
