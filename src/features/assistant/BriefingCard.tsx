import React from 'react';
import { Sparkles, CheckCircle, RefreshCw } from 'lucide-react';
import { GroundedAIResponse } from '../../services/ai/types';

interface BriefingCardProps {
  profileName: string;
  cityName: string;
  briefing: GroundedAIResponse | null;
  isLoading: boolean;
}

export const BriefingCard: React.FC<BriefingCardProps> = React.memo(({
  profileName,
  cityName,
  briefing,
  isLoading,
}) => {
  return (
    <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 bg-midnight-900/60 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Today&apos;s Air Quality Summary</h2>
            <span className="text-[11px] text-slate-400">
              Prepared for {profileName} • {cityName}
            </span>
          </div>
        </div>

        {briefing && (
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-semibold">
              <CheckCircle className="w-3 h-3 text-teal-400" />
              <span>{briefing.groundingStatus}</span>
            </span>
            <span className="text-xs font-mono text-cyan-400 ml-1">
              {briefing.isDeterministicFallback
                ? `Deterministic Fallback (${briefing.fallbackReason || 'OFFLINE'})`
                : `Gemini (${briefing.model || 'Live'})`}
            </span>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-slate-400 text-xs flex items-center justify-center space-x-2">
          <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
          <span>Compiling verified environmental telemetry...</span>
        </div>
      ) : briefing ? (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-midnight-950/80 border border-white/5 space-y-2">
            <h3 className="text-base font-bold text-cyan-300">{briefing.headline}</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">{briefing.summary}</p>
            <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line pt-2 border-t border-white/5">
              {briefing.detailedExplanation}
            </p>
          </div>

          {briefing.actionableGuidance.length > 0 && (
            <div className="p-3.5 rounded-xl bg-midnight-950/60 border border-white/5 space-y-1.5">
              <span className="text-[11px] text-teal-300 font-bold block">Priority Actionable Guidance:</span>
              <ul className="list-disc pl-4 text-xs text-slate-300 space-y-1">
                {briefing.actionableGuidance.map((action, i) => (
                  <li key={i}>{action}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-2 flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-500 font-medium">Data points used:</span>
            {briefing.supportingFactIds.map((factId: string) => (
              <span
                key={factId}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-midnight-800 text-cyan-300 border border-white/10"
              >
                #{factId}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
});
