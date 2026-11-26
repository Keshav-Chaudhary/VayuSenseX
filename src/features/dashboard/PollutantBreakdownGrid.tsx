import React from 'react';
import { AQIResult, AQIStandard } from '../../domain/types';

interface PollutantBreakdownGridProps {
  aqi: AQIResult;
  standard: AQIStandard;
}

export const PollutantBreakdownGrid: React.FC<PollutantBreakdownGridProps> = React.memo(({ aqi, standard }) => {
  return (
    <div className="bg-[var(--surface-2)] rounded-2xl p-6 border border-[var(--border-faint)] shadow-[var(--shadow-sm)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[var(--border)] gap-2">
        <div>
          <h2 className="text-lg font-bold text-[var(--fg)]">What&apos;s in the Air Right Now?</h2>
          <p className="text-xs text-[var(--fg-muted)]">
            Individual pollutants checked against {standard === 'CPCB' ? 'India (CPCB)' : 'US EPA'} safety limits.
          </p>
        </div>
        <span className="text-xs text-[var(--fg-subtle)]">
          0 = Cleanest Air • 500 = Most Severe
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-4">
        {aqi.subIndices.map((sub) => {
          const isDominant = sub.pollutant === aqi.dominantPollutant;
          return (
            <div
              key={sub.pollutant}
              className={`p-4 rounded-xl border transition-all ${
                isDominant
                  ? 'bg-[var(--surface-3)] border-[var(--accent-line)] shadow-xs'
                  : 'bg-[var(--surface)] border-[var(--border-faint)]'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-[var(--fg-subtle)] mb-1">
                <span className="font-mono uppercase font-bold text-[var(--fg)]">
                  {sub.pollutant}
                </span>
                {isDominant && (
                  <span className="px-1.5 py-0.2 rounded-full bg-[var(--accent-subtle)] border border-[var(--accent-line)] text-[var(--accent)] text-[10px] font-bold">
                    Dominant
                  </span>
                )}
              </div>

              <div className="text-2xl font-bold font-mono text-[var(--fg)] mt-1 tnum">
                {sub.subIndex}
              </div>

              <div className="text-xs text-[var(--fg-subtle)] mt-1">
                <span className="font-mono text-[var(--fg-muted)]">{sub.concentration}</span>
                <span className="text-[10px] ml-1 text-[var(--fg-subtle)]">{sub.pollutant === 'co' ? 'mg/m³' : 'µg/m³'}</span>
              </div>

              <div className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--fg-subtle)] truncate">
                {sub.category.replace('_', ' ')}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
