import React from 'react';
import { Info, Sparkles } from 'lucide-react';
import { ActionRecommendation, ActionStatus } from '../../domain/planner/planner-types';

interface RecommendationCardProps {
  rec: ActionRecommendation;
  currentStatus: ActionStatus;
  isExpanded: boolean;
  onStatusChange: (actionId: string, status: ActionStatus) => void;
  onToggleExpand: () => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  rec,
  currentStatus,
  isExpanded,
  onStatusChange,
  onToggleExpand,
}) => (
  <div
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
          {(['PLANNED', 'COMPLETED', 'SKIPPED'] as const).map(status => (
            <button
              key={status}
              onClick={() => onStatusChange(rec.id, status)}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                currentStatus === status
                  ? status === 'PLANNED'
                    ? 'bg-cyan-500 text-midnight-950 font-bold'
                    : status === 'COMPLETED'
                    ? 'bg-teal-500 text-midnight-950 font-bold'
                    : 'bg-slate-700 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {status === 'PLANNED' ? 'Planned' : status === 'COMPLETED' ? 'Done' : 'Skip'}
            </button>
          ))}
        </div>

        <button
          onClick={onToggleExpand}
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
