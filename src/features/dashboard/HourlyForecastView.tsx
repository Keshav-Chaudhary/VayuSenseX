import React from 'react';
import { Clock, Wind, Thermometer } from 'lucide-react';
import { HourlyForecastPoint } from '../../services/environment/types';
import { AQIStandard } from '../../domain/types';

interface HourlyForecastViewProps {
  forecast: HourlyForecastPoint[];
  standard: AQIStandard;
}

export const HourlyForecastView: React.FC<HourlyForecastViewProps> = ({ forecast, standard }) => {
  if (!forecast || forecast.length === 0) return null;

  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/10 gap-2">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-cyan-400">
            <Clock className="w-3.5 h-3.5" />
            <span>24-Hour Atmospheric Timeline</span>
          </div>
          <h2 className="text-lg font-bold text-white mt-0.5">Pollution Dispersion & Hourly Forecast</h2>
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span>Cleanest Activity Window Highlighted</span>
        </div>
      </div>

      {/* Horizontal timeline cards */}
      <div className="flex space-x-3 overflow-x-auto pb-3 pt-1 scrollbar-thin">
        {forecast.map((pt) => {
          const aqiVal = standard === 'CPCB' ? pt.cpcbAqi : pt.usepaAqi;
          const isHighSmog = pt.pm25 > 150;

          return (
            <div
              key={pt.timestamp}
              className={`shrink-0 w-36 p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                pt.isCleanestWindow
                  ? 'bg-emerald-950/40 border-emerald-500/50 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/30'
                  : isHighSmog
                  ? 'bg-midnight-900/80 border-rose-900/30'
                  : 'bg-midnight-900/50 border-white/5'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-300 font-semibold">{pt.hourLabel}</span>
                  {pt.isCleanestWindow && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500 text-midnight-950 font-bold uppercase tracking-wider">
                      Cleanest
                    </span>
                  )}
                </div>

                <div className="mt-2.5">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">PM2.5</span>
                  <div className="text-xl font-bold font-mono text-white">
                    {pt.pm25} <span className="text-[10px] font-normal text-slate-400">µg/m³</span>
                  </div>
                </div>

                <div className="mt-1 text-xs">
                  <span className="text-slate-400 font-mono text-[11px]">{standard} AQI: </span>
                  <span className="font-mono font-bold text-cyan-300">{aqiVal}</span>
                </div>
              </div>

              {/* Weather indicators at this hour */}
              <div className="mt-3 pt-2.5 border-t border-white/5 grid grid-cols-2 gap-1 text-[10px] text-slate-400 font-mono">
                <span className="flex items-center">
                  <Thermometer className="w-2.5 h-2.5 mr-1 text-rose-400" />
                  {pt.temperature}°C
                </span>
                <span className="flex items-center">
                  <Wind className="w-2.5 h-2.5 mr-1 text-teal-400" />
                  {pt.windSpeed} km/h
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
