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
      <div className="rounded-xl bg-midnight-900/90 border border-white/10 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between text-xs space-y-2 sm:space-y-0">
        <div className="flex items-center space-x-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300">
            <strong>Data Provenance:</strong>{' '}
            <span className="font-mono text-cyan-300 uppercase px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-[10px]">
              {provenance}
            </span>{' '}
            via {snapshot.source}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-slate-400 text-[11px] font-mono">
          {isCached && <span className="text-cyan-400/80">Cached</span>}
          {isStale && <span className="text-amber-400 font-bold">Stale Snapshot</span>}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center space-x-1 hover:text-white transition-colors"
            title="Refresh Telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Cleanest Window Notification if identified */}
      {cleanestForecastWindow && (
        <div className="rounded-xl bg-emerald-950/50 border border-emerald-600/40 p-4 flex items-center justify-between text-xs text-emerald-200">
          <div className="flex items-center space-x-2.5">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Cleanest Activity Window Forecast:</strong> Outdoor PM2.5 drops to approximately{' '}
              <strong className="text-emerald-300 font-mono">{cleanestForecastWindow.pm25} µg/m³</strong> around{' '}
              <strong className="text-white font-mono">{cleanestForecastWindow.hourLabel}</strong>. Ideal window for essential errands or room ventilation.
            </span>
          </div>
        </div>
      )}

      {/* Location Switcher & Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl glass-panel border border-white/10">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>Telemetry Location</span>
            <span>•</span>
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Observed: {new Date(snapshot.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-3">
            <span>{snapshot.location.city}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 font-normal">
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
              className="w-full sm:w-64 pl-8 pr-3 py-1.5 bg-midnight-950 border border-white/10 rounded-xl text-white font-mono text-xs focus:border-cyan-500 focus:outline-none"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </form>

          <div className="flex items-center bg-midnight-900 border border-white/10 rounded-xl p-1 text-xs shrink-0">
            <button
              onClick={() => onSelectCity('delhi')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeCityKey === 'delhi'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Delhi (Severe Smog)
            </button>
            <button
              onClick={() => onSelectCity('bengaluru')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeCityKey === 'bengaluru'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
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
        <div className="lg:col-span-7 glass-panel rounded-2xl p-6 border border-white/10 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Composite Air Quality Index</span>
              <div className="text-sm font-semibold text-slate-200 mt-0.5">
                Calculated via <span className="text-cyan-400 font-bold">{standard} Standards</span>
              </div>
            </div>

            {/* Standard Selector */}
            <div className="flex items-center bg-midnight-950 p-1 rounded-lg border border-white/10 text-xs">
              <button
                onClick={() => onStandardChange('CPCB')}
                className={`px-2.5 py-1 rounded font-medium ${standard === 'CPCB' ? 'bg-cyan-500 text-midnight-950 font-bold' : 'text-slate-400'}`}
              >
                CPCB (India)
              </button>
              <button
                onClick={() => onStandardChange('USEPA')}
                className={`px-2.5 py-1 rounded font-medium ${standard === 'USEPA' ? 'bg-cyan-500 text-midnight-950 font-bold' : 'text-slate-400'}`}
              >
                US EPA
              </button>
            </div>
          </div>

          {/* Big Number and Health Tier */}
          <div className="py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-baseline space-x-3">
                <span className="text-7xl font-black font-mono tracking-tight" style={{ color: aqi.categoryColor }}>
                  {aqi.aqi}
                </span>
                <span className="text-slate-400 font-mono text-sm">/ 500 AQI</span>
              </div>

              <div 
                className="inline-block mt-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
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
            <div className="p-4 rounded-xl bg-midnight-900/90 border border-white/10 sm:text-right">
              <span className="text-xs text-slate-400">Dominant Pollutant</span>
              <p className="text-2xl font-bold font-mono text-cyan-300 uppercase mt-0.5">
                {aqi.dominantPollutant.toUpperCase()}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Sub-index: <span className="font-mono text-slate-200 font-semibold">{aqi.aqi}</span>
              </p>
            </div>
          </div>

          {/* Implications and Action Bar */}
          <div className="p-4 rounded-xl bg-midnight-900/70 border border-white/5 space-y-2">
            <div className="flex items-start space-x-2 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200">Health Implications: </strong>
                <span className="text-slate-300">{aqi.healthImplications}</span>
              </div>
            </div>
            <div className="flex items-start space-x-2 text-xs pt-1 border-t border-white/5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200">Recommended Precaution: </strong>
                <span className="text-slate-300">{aqi.recommendedPrecaution}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Meteorological & Atmospheric Inversion Engine (5 Cols) */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-6 border border-white/10 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Atmospheric Dynamics</span>
              <span className="text-xs font-mono text-cyan-400">Module B Diagnostics</span>
            </div>

            {/* Inversion Status Alert */}
            <div className={`mt-4 p-3 rounded-xl border ${stagnationConfig.bg} ${stagnationConfig.border} flex items-center space-x-3`}>
              <div className="w-2.5 h-2.5 rounded-full bg-red-400 animate-ping" />
              <div className="text-xs">
                <span className="font-bold text-slate-200">Dispersal Condition: </span>
                <span className={stagnationConfig.color}>{stagnationConfig.text}</span>
              </div>
            </div>
          </div>

          {/* Meteorological Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-midnight-900/80 border border-white/5">
              <div className="flex items-center space-x-2 text-slate-400 mb-1">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Boundary Layer Height</span>
              </div>
              <div className="text-lg font-bold font-mono text-white">
                {snapshot.weather.boundaryLayerHeight ?? 'N/A'} m
              </div>
              <span className="text-[11px] text-amber-400">
                {snapshot.weather.boundaryLayerHeight && snapshot.weather.boundaryLayerHeight < 300 ? 'Thermal Inversion Trap' : 'Normal Mixing'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-midnight-900/80 border border-white/5">
              <div className="flex items-center space-x-2 text-slate-400 mb-1">
                <Wind className="w-3.5 h-3.5 text-teal-400" />
                <span>Wind Speed</span>
              </div>
              <div className="text-lg font-bold font-mono text-white">
                {snapshot.weather.windSpeed} km/h
              </div>
              <span className="text-[11px] text-slate-400">
                {snapshot.weather.windSpeed < 5 ? 'Calm / Stagnant' : 'Moderate Flow'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-midnight-900/80 border border-white/5">
              <div className="flex items-center space-x-2 text-slate-400 mb-1">
                <Thermometer className="w-3.5 h-3.5 text-rose-400" />
                <span>Ambient Temp</span>
              </div>
              <div className="text-lg font-bold font-mono text-white">
                {snapshot.weather.temperature} °C
              </div>
              <span className="text-[11px] text-slate-400">Cold Morning Layer</span>
            </div>

            <div className="p-3 rounded-xl bg-midnight-900/80 border border-white/5">
              <div className="flex items-center space-x-2 text-slate-400 mb-1">
                <Droplets className="w-3.5 h-3.5 text-blue-400" />
                <span>Relative Humidity</span>
              </div>
              <div className="text-lg font-bold font-mono text-white">
                {snapshot.weather.relativeHumidity} %
              </div>
              <span className="text-[11px] text-slate-400">Aerosol Hygroscopic Growth</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-normal border-t border-white/5 pt-3">
            <strong>Scientific Note:</strong> When boundary-layer height drops below 300m with wind speeds under 5 km/h, vertical mixing is suppressed, trapping urban emissions near breathing zones.
          </p>
        </div>

      </div>

      {/* 24-Hour Forecast Timeline */}
      {hourlyForecast && hourlyForecast.length > 0 && (
        <HourlyForecastView forecast={hourlyForecast} standard={standard} />
      )}

      {/* Pollutant Sub-Index Breakdown Table */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-2">
          <div>
            <h2 className="text-lg font-bold text-white">Sub-Index Breakdown by Pollutant</h2>
            <p className="text-xs text-slate-400">
              Evaluated strictly according to {standard} concentration breakpoints.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Formula: Ip = [(I_hi - I_lo)/(B_hi - B_lo)] * (Cp - B_lo) + I_lo
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
                    ? 'bg-midnight-800/90 border-cyan-500/40 shadow-glow-cyan'
                    : 'bg-midnight-900/60 border-white/5'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="font-mono uppercase font-bold text-slate-200">
                    {sub.pollutant}
                  </span>
                  {isDominant && (
                    <span className="px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 text-[10px]">
                      Dominant
                    </span>
                  )}
                </div>

                <div className="text-2xl font-bold font-mono text-white mt-1">
                  {sub.subIndex}
                </div>

                <div className="text-xs text-slate-400 mt-1">
                  <span className="font-mono text-slate-300">{sub.concentration}</span>
                  <span className="text-[10px] ml-1 text-slate-500">{sub.pollutant === 'co' ? 'mg/m³' : 'µg/m³'}</span>
                </div>

                <div className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 truncate">
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
