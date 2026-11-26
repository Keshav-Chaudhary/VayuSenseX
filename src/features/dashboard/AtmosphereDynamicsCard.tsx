import React from 'react';
import { Wind, Layers, Thermometer, Droplets } from 'lucide-react';
import { EnvironmentalSnapshot } from '../../domain/types';

interface AtmosphereDynamicsCardProps {
  snapshot: EnvironmentalSnapshot;
  stagnationConfig: { color: string; bg: string; border: string; text: string };
}

export const AtmosphereDynamicsCard: React.FC<AtmosphereDynamicsCardProps> = React.memo(({
  snapshot,
  stagnationConfig,
}) => {
  return (
    <div className="lg:col-span-5 bg-[var(--surface-2)] rounded-2xl p-6 border border-[var(--border-faint)] hover:border-[var(--accent-line)] shadow-[var(--shadow-sm)] flex flex-col justify-between space-y-6 transition-all">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <span className="text-xs font-mono uppercase tracking-wider text-[var(--fg-subtle)]">Why Pollution Stays or Clears</span>
          <span className="text-xs font-mono text-[var(--accent)] font-semibold">Weather &amp; Wind Check</span>
        </div>

        <div
          role="alert"
          aria-live="polite"
          className={`mt-4 p-3 rounded-xl border ${stagnationConfig.bg} ${stagnationConfig.border} flex items-center space-x-3`}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-red-400 animate-ping" />
          <div className="text-xs">
            <span className="font-bold text-[var(--fg)]">Dispersal Condition: </span>
            <span className={stagnationConfig.color}>{stagnationConfig.text}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-[var(--surface-3)] border border-[var(--border)]">
          <div className="flex items-center space-x-2 text-[var(--fg-subtle)] mb-1">
            <Layers className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Smog Ceiling Height</span>
          </div>
          <div className="text-lg font-bold font-mono text-[var(--fg)]">
            {snapshot.weather.boundaryLayerHeight ?? 'N/A'} m
          </div>
          <span className="text-[11px] text-amber-400">
            {snapshot.weather.boundaryLayerHeight && snapshot.weather.boundaryLayerHeight < 300 ? 'Smog Trapped Low' : 'Good Air Mixing'}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[var(--surface-3)] border border-[var(--border)]">
          <div className="flex items-center space-x-2 text-[var(--fg-subtle)] mb-1">
            <Wind className="w-3.5 h-3.5 text-teal-400" />
            <span>Wind Speed</span>
          </div>
          <div className="text-lg font-bold font-mono text-[var(--fg)]">
            {snapshot.weather.windSpeed} km/h
          </div>
          <span className="text-[11px] text-[var(--fg-subtle)]">
            {snapshot.weather.windSpeed < 5 ? 'Calm / Stagnant' : 'Moderate Flow'}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[var(--surface-3)] border border-[var(--border)]">
          <div className="flex items-center space-x-2 text-[var(--fg-subtle)] mb-1">
            <Thermometer className="w-3.5 h-3.5 text-rose-400" />
            <span>Ambient Temp</span>
          </div>
          <div className="text-lg font-bold font-mono text-[var(--fg)]">
            {snapshot.weather.temperature} °C
          </div>
          <span className="text-[11px] text-[var(--fg-subtle)]">Cold Morning Layer</span>
        </div>

        <div className="p-3 rounded-xl bg-[var(--surface-3)] border border-[var(--border)]">
          <div className="flex items-center space-x-2 text-[var(--fg-subtle)] mb-1">
            <Droplets className="w-3.5 h-3.5 text-blue-400" />
            <span>Humidity</span>
          </div>
          <div className="text-lg font-bold font-mono text-[var(--fg)]">
            {snapshot.weather.relativeHumidity} %
          </div>
          <span className="text-[11px] text-[var(--fg-subtle)]">Haze &amp; Moisture</span>
        </div>
      </div>

      <p className="text-[11px] text-[var(--fg-subtle)] leading-normal border-t border-[var(--border)] pt-3">
        <strong className="text-[var(--fg-muted)]">Why this matters:</strong> When winds are calm and cold air traps pollution below 300m, smoke and dust build up right where we breathe.
      </p>
    </div>
  );
});
