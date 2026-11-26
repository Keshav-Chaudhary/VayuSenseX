import React, { useState } from 'react';
import {
  AlertTriangle,
  Clock,
  MapPin,
  Search,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { EnvironmentalSnapshot, AQIStandard } from '../../domain/types';
import { HourlyForecastPoint, DataProvenance } from '../../services/environment/types';
import { HourlyForecastView } from './HourlyForecastView';
import { PollutantBreakdownGrid } from './PollutantBreakdownGrid';
import { AtmosphereDynamicsCard } from './AtmosphereDynamicsCard';
import { AqiOverviewCard } from './AqiOverviewCard';

interface DashboardPageProps {
  snapshot: EnvironmentalSnapshot;
  standard: AQIStandard;
  onStandardChange: (standard: AQIStandard) => void;
  onSelectCity: (cityKey: 'delhi' | 'bengaluru') => void;
  activeCityKey: 'delhi' | 'bengaluru';
  onSearchLocation: (query: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
  provenance: DataProvenance;
  isCached: boolean;
  isStale: boolean;
  hourlyForecast?: HourlyForecastPoint[];
  cleanestForecastWindow?: { timestamp: string; pm25: number; hourLabel: string };
  telemetryError?: string | null;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  snapshot,
  standard,
  onStandardChange,
  onSelectCity,
  activeCityKey,
  onSearchLocation,
  onRefresh,
  isLoading,
  provenance,
  isCached,
  isStale,
  hourlyForecast,
  cleanestForecastWindow,
  telemetryError,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const aqi = standard === 'CPCB' ? snapshot.cpcbAqi : snapshot.usEpaAqi;

  const stagnationConfig = {
    LOW: { color: 'text-emerald-400', bg: 'bg-emerald-950/50', border: 'border-emerald-800/40', text: 'Low Stagnation Risk (Favorable Dispersion)' },
    MODERATE: { color: 'text-amber-400', bg: 'bg-amber-950/50', border: 'border-amber-800/40', text: 'Moderate Stagnation Risk' },
    HIGH: { color: 'text-orange-400', bg: 'bg-orange-950/50', border: 'border-orange-800/40', text: 'High Pollution Accumulation' },
    CRITICAL: { color: 'text-red-400', bg: 'bg-red-950/50', border: 'border-red-800/40', text: 'Critical Thermal Inversion & Atmospheric Stagnation' },
  }[snapshot.stagnationRisk];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearchLocation(searchQuery.trim());
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Telemetry & Provenance Alert Bar */}
      <div className="rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] p-4 flex flex-col sm:flex-row sm:items-center justify-between text-xs space-y-2 sm:space-y-0 shadow-[var(--shadow-sm)]">
        <div className="flex items-center space-x-2.5">
          <span className="w-2 h-2 rounded-full bg-[var(--positive)] animate-pulse" />
          <span className="text-[var(--fg-muted)]">
            <strong className="text-[var(--fg)]">Data Source:</strong>{' '}
            <span className="font-mono text-[var(--accent)] uppercase px-2 py-0.5 rounded-full bg-[var(--accent-subtle)] border border-[var(--accent-line)] text-[10px] font-bold">
              {provenance}
            </span>{' '}
            from {snapshot.source}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[var(--fg-subtle)] text-[11px] font-mono">
          {isCached && <span className="text-[var(--accent)] font-semibold">Cached</span>}
          {isStale && <span className="text-[var(--caution)] font-bold">Stale Snapshot</span>}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center space-x-1.5 hover:text-[var(--fg)] text-[var(--fg-muted)] transition-colors px-2 py-1 rounded-lg hover:bg-[var(--surface-3)]"
            title="Refresh Telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[var(--accent)]' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Explicit Offline / Provider Error Banner (never silent) */}
      {telemetryError && (
        <div role="alert" className="rounded-2xl bg-[var(--caution-subtle)] border border-[var(--caution)]/40 p-4 flex items-center justify-between text-xs text-[var(--caution)]">
          <div className="flex items-center space-x-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span><strong>Provider Notice:</strong> {telemetryError}</span>
          </div>
          <button onClick={onRefresh} className="px-3 py-1 rounded-lg bg-[var(--surface)] text-[var(--fg)] font-semibold hover:bg-[var(--surface-3)]">
            Retry Live Sync
          </button>
        </div>
      )}

      {/* Cleanest Window Notification if identified */}
      {cleanestForecastWindow && (
        <div className="rounded-2xl bg-[var(--positive-subtle)] border border-[var(--positive-subtle)] p-4 flex items-center justify-between text-xs text-[var(--positive)] shadow-[var(--shadow-sm)]">
          <div className="flex items-center space-x-2.5">
            <Sparkles className="w-4 h-4 text-[var(--positive)] shrink-0" />
            <span>
              <strong className="font-bold">Cleanest Activity Window Forecast:</strong> Outdoor PM2.5 drops to approximately{' '}
              <strong className="font-mono font-bold">{cleanestForecastWindow.pm25} µg/m³</strong> around{' '}
              <strong className="text-[var(--fg)] font-mono font-bold">{cleanestForecastWindow.hourLabel}</strong>. Ideal window for essential errands or room ventilation.
            </span>
          </div>
        </div>
      )}

      {/* Location Switcher & Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] shadow-[var(--shadow-sm)]">
        <div>
          <div className="flex items-center space-x-2 text-xs text-[var(--fg-subtle)] mb-1">
            <MapPin className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Selected City</span>
            <span>•</span>
            <Clock className="w-3.5 h-3.5 text-[var(--fg-subtle)]" />
            <span>Updated: {new Date(snapshot.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--fg)] tracking-tight flex items-center space-x-3">
            <span>{snapshot.location.city}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--surface-3)] border border-[var(--border)] text-[var(--fg-muted)] font-medium">
              {snapshot.location.area}
            </span>
          </h1>
        </div>

        {/* Location Search & Preset Toggles */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search city (e.g. Mumbai, Lahore)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-8 pr-3 py-2 bg-[var(--surface)] border border-[var(--border-strong)] rounded-xl text-[var(--fg)] font-mono text-xs focus:border-[var(--accent)] focus:outline-none transition-colors"
            />
            <Search className="w-3.5 h-3.5 text-[var(--fg-subtle)] absolute left-2.5 top-2.5" />
          </form>

          <div className="flex items-center bg-[var(--surface)] border border-[var(--border)] rounded-xl p-1 text-xs shrink-0">
            <button
              onClick={() => onSelectCity('delhi')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeCityKey === 'delhi'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold'
                  : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
              }`}
            >
              Delhi (Severe Smog)
            </button>
            <button
              onClick={() => onSelectCity('bengaluru')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeCityKey === 'bengaluru'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold'
                  : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
              }`}
            >
              Bengaluru (Baseline)
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: AQI Card & Atmospheric Inversion Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main AQI Gauge Card (7 Cols) */}
        <AqiOverviewCard aqi={aqi} standard={standard} onStandardChange={onStandardChange} />

        {/* Meteorological & Atmospheric Inversion Engine (5 Cols) */}
        <AtmosphereDynamicsCard snapshot={snapshot} stagnationConfig={stagnationConfig} />
      </div>

      {/* 24-Hour Forecast Timeline */}
      {hourlyForecast && hourlyForecast.length > 0 && (
        <HourlyForecastView forecast={hourlyForecast} standard={standard} />
      )}

      {/* Pollutant Sub-Index Breakdown Table */}
      <PollutantBreakdownGrid aqi={aqi} standard={standard} />

    </div>
  );
};
