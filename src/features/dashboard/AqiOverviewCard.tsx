import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { AQIResult, AQIStandard } from '../../domain/types';

interface AqiOverviewCardProps {
  aqi: AQIResult;
  standard: AQIStandard;
  onStandardChange: (std: AQIStandard) => void;
}

export const AqiOverviewCard: React.FC<AqiOverviewCardProps> = ({
  aqi,
  standard,
  onStandardChange,
}) => (
  <div className="lg:col-span-7 bg-[var(--surface-2)] rounded-2xl p-6 border border-[var(--border-faint)] hover:border-[var(--accent-line)] shadow-[var(--shadow-sm)] relative overflow-hidden flex flex-col justify-between transition-all">
    <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
      <div>
        <span className="text-xs font-mono uppercase tracking-wider text-[var(--fg-subtle)]">Overall Air Quality Score</span>
        <div className="text-sm font-semibold text-[var(--fg-muted)] mt-0.5">
          Measured on <span className="text-[var(--accent)] font-bold">{standard === 'CPCB' ? 'India (CPCB)' : 'US EPA'} Scale</span>
        </div>
      </div>

      {/* Standard Selector */}
      <div className="flex items-center bg-[var(--surface-3)] p-0.5 rounded-full border border-[var(--border)] text-xs">
        <button
          onClick={() => onStandardChange('CPCB')}
          className={`px-2.5 py-1 rounded-full font-bold text-[11px] transition-all ${
            standard === 'CPCB' ? 'bg-[var(--accent)] text-white shadow-xs' : 'text-[var(--fg-muted)]'
          }`}
        >
          CPCB (India)
        </button>
        <button
          onClick={() => onStandardChange('USEPA')}
          className={`px-2.5 py-1 rounded-full font-bold text-[11px] transition-all ${
            standard === 'USEPA' ? 'bg-[var(--accent)] text-white shadow-xs' : 'text-[var(--fg-muted)]'
          }`}
        >
          US EPA
        </button>
      </div>
    </div>

    {/* Big Number and Health Tier */}
    <div className="py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
      <div>
        <div className="flex items-baseline space-x-3">
          <span className="text-7xl font-black font-mono tracking-tight tnum" style={{ color: aqi.categoryColor }}>
            {aqi.aqi}
          </span>
          <span className="text-[var(--fg-subtle)] font-mono text-sm">/ 500 AQI</span>
        </div>

        <div
          className="inline-block mt-3 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-xs"
          style={{
            backgroundColor: `${aqi.categoryColor}25`,
            color: aqi.categoryColor,
            border: `1px solid ${aqi.categoryColor}60`,
          }}
        >
          {aqi.categoryLabel}
        </div>
      </div>

      {/* Dominant Pollutant badge */}
      <div className="p-4 rounded-xl bg-[var(--surface-3)] border border-[var(--border)] sm:text-right">
        <span className="text-xs text-[var(--fg-subtle)]">Dominant Pollutant</span>
        <p className="text-2xl font-bold font-mono text-[var(--accent)] uppercase mt-0.5">
          {aqi.dominantPollutant.toUpperCase()}
        </p>
        <p className="text-xs text-[var(--fg-muted)] mt-1">
          Sub-index: <span className="font-mono text-[var(--fg)] font-semibold">{aqi.aqi}</span>
        </p>
      </div>
    </div>

    {/* Implications and Action Bar */}
    <div className="p-4 rounded-xl bg-[var(--surface-3)] border border-[var(--border-faint)] space-y-2">
      <div className="flex items-start space-x-2 text-xs">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-[var(--fg)]">Health Implications: </strong>
          <span className="text-[var(--fg-muted)]">{aqi.healthImplications}</span>
        </div>
      </div>
      <div className="flex items-start space-x-2 text-xs pt-2 border-t border-[var(--border-faint)]">
        <ShieldCheck className="w-4 h-4 text-[var(--positive)] shrink-0 mt-0.5" />
        <div>
          <strong className="text-[var(--fg)]">Recommended Precaution: </strong>
          <span className="text-[var(--fg-muted)]">{aqi.recommendedPrecaution}</span>
        </div>
      </div>
    </div>
  </div>
);
