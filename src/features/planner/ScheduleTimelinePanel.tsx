import React from 'react';
import { ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { OptimizedScheduleItem } from '../../domain/planner/planner-types';

interface ScheduleTimelinePanelProps {
  scheduleItems: OptimizedScheduleItem[];
}

export const ScheduleTimelinePanel: React.FC<ScheduleTimelinePanelProps> = ({ scheduleItems }) => (
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
      {scheduleItems.map((slot) => (
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
            <span className="text-slate-400">Inhaled Dose:</span>
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
);
