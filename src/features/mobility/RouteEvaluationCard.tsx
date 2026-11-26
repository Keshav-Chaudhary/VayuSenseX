import React from 'react';
import { ArrowRight, Clock } from 'lucide-react';
import { RouteEvaluation } from '../../domain/mobility/types';

interface RouteEvaluationCardProps {
  route: RouteEvaluation;
}

export const RouteEvaluationCard: React.FC<RouteEvaluationCardProps> = ({ route }) => (
  <div
    className={`glass-card p-5 rounded-2xl border transition-all ${
      route.isLowestExposure
        ? 'border-teal-500/40 bg-teal-950/20 shadow-glow-cyan/5'
        : 'border-white/10 bg-midnight-900/60'
    }`}
  >
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
      <div>
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-base font-bold text-white">{route.title}</span>
          {route.isLowestExposure && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
              ★ Cleanest Route
            </span>
          )}
          {route.isFastest && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Fastest
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-400 leading-snug">{route.scientificNotes}</p>
      </div>

      <div className="text-right shrink-0">
        <span className="text-xl font-bold font-mono text-teal-300 block">
          {route.totalInhaledDoseUg} µg
        </span>
        <span className="text-[10px] text-slate-400">Total Inhaled Dose</span>
      </div>
    </div>

    {/* Metric Badges */}
    <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/5 text-xs">
      <div className="p-2.5 rounded-lg bg-midnight-950/60 border border-white/5">
        <span className="text-[10px] text-slate-500 block">Travel Duration</span>
        <div className="flex items-center space-x-1.5 mt-0.5">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-mono font-bold text-white">{route.totalDurationMinutes} min</span>
        </div>
      </div>

      <div className="p-2.5 rounded-lg bg-midnight-950/60 border border-white/5">
        <span className="text-[10px] text-slate-500 block">Corridor Distance</span>
        <span className="font-mono font-bold text-white block mt-0.5">{route.totalDistanceKm} km</span>
      </div>

      <div className="p-2.5 rounded-lg bg-midnight-950/60 border border-white/5">
        <span className="text-[10px] text-slate-500 block">Lifecycle CO2e</span>
        <span className="font-mono font-bold text-emerald-300 block mt-0.5">
          {route.totalLifecycleCO2eGrams > 1000
            ? `${(route.totalLifecycleCO2eGrams / 1000).toFixed(2)} kg`
            : `${route.totalLifecycleCO2eGrams} g`}
        </span>
      </div>
    </div>

    {/* Segments Breakdown */}
    <div className="mt-3 space-y-1.5 text-[11px]">
      <span className="text-slate-500 font-semibold block text-[10px]">Segment Corridor Steps:</span>
      {route.segments.map((seg, i) => (
        <div key={i} className="flex items-center justify-between p-2 rounded bg-midnight-950/40 text-slate-300">
          <div className="flex items-center space-x-2 truncate">
            <span className="font-mono text-slate-500">{i + 1}.</span>
            <span>{seg.fromNodeName}</span>
            <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
            <span>{seg.toNodeName}</span>
            <span className="text-[10px] text-cyan-400 font-mono">({seg.corridorType.replace(/_/g, ' ')})</span>
          </div>
          <span className="font-mono text-slate-400 shrink-0 ml-2">{seg.durationMinutes}m • {seg.inhaledDoseUg}µg</span>
        </div>
      ))}
    </div>
  </div>
);
