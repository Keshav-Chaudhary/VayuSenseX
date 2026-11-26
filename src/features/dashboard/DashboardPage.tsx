import React, { useState } from 'react';
import { 
  Wind, 
  Layers, 
  Thermometer, 
  Droplets, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Search, 
  RefreshCw, 
  Sparkles
} from 'lucide-react';
import { EnvironmentalSnapshot, AQIStandard } from '../../domain/types';
import { HourlyForecastPoint, DataProvenance } from '../../services/environment/types';
import { HourlyForecastView } from './HourlyForecastView';

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
                  border: `1px solid ${aqi.categoryColor}60`
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

        {/* Meteorological & Atmospheric Inversion Engine (5 Cols) */}
        <div className="lg:col-span-5 bg-[var(--surface-2)] rounded-2xl p-6 border border-[var(--border-faint)] hover:border-[var(--accent-line)] shadow-[var(--shadow-sm)] flex flex-col justify-between space-y-6 transition-all">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--fg-subtle)]">Why Pollution Stays or Clears</span>
              <span className="text-xs font-mono text-[var(--accent)] font-semibold">Weather &amp; Wind Check</span>
            </div>

            {/* Inversion Status Alert */}
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

          {/* Meteorological Metrics Grid */}
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

      </div>

      {/* 24-Hour Forecast Timeline */}
      {hourlyForecast && hourlyForecast.length > 0 && (
        <HourlyForecastView forecast={hourlyForecast} standard={standard} />
      )}

      {/* Pollutant Sub-Index Breakdown Table */}
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

    </div>
  );
};
