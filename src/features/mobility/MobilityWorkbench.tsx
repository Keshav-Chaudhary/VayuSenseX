import React, { useState, useMemo } from 'react';
import { 
  Bike, Compass, ShieldCheck, Layers 
} from 'lucide-react';
import { evaluateCleanCorridorRoutes, URBAN_NODES } from '../../domain/mobility';
import { compareTransportEmissions, TransportMode } from '../../domain/sustainability';
import { RouteEvaluationCard } from './RouteEvaluationCard';
import { LifecycleComparisonTab } from './LifecycleComparisonTab';

interface MobilityWorkbenchProps {
  currentOutdoorPm25?: number;
  currentCity?: string;
}

export const MobilityWorkbench: React.FC<MobilityWorkbenchProps> = ({
  currentOutdoorPm25 = 150,
  currentCity = 'Active Location',
}) => {
  const [activeTab, setActiveTab] = useState<'routing' | 'lifecycle'>('routing');

  // Dijkstra clean routing state
  const [originId, setOriginId] = useState<string>('NODE_CBD');
  const [destinationId, setDestinationId] = useState<string>('NODE_RESIDENTIAL');
  const [preferredMode, setPreferredMode] = useState<TransportMode>('PETROL_CAR');
  const [optimizationGoal, setOptimizationGoal] = useState<'LOWEST_EXPOSURE' | 'SHORTEST_TIME' | 'BALANCED'>('LOWEST_EXPOSURE');
  const [ambientPm25, setAmbientPm25] = useState<number>(currentOutdoorPm25);

  React.useEffect(() => {
    setAmbientPm25(currentOutdoorPm25);
  }, [currentOutdoorPm25]);

  // Lifecycle emissions state
  const [distanceKm, setDistanceKm] = useState<number>(16);
  const [currentMode, setCurrentMode] = useState<TransportMode>('PETROL_CAR');
  const [alternativeMode, setAlternativeMode] = useState<TransportMode>('METRO_RAIL');
  const [daysPerWeek, setDaysPerWeek] = useState<number>(5);

  const routeEvaluations = useMemo(() => {
    return evaluateCleanCorridorRoutes({
      originNodeId: originId,
      destinationNodeId: destinationId,
      mode: preferredMode,
      optimizationGoal,
      ambientRegionalPm25: ambientPm25,
    });
  }, [originId, destinationId, preferredMode, optimizationGoal, ambientPm25]);

  const emissionsComparison = useMemo(() => {
    return compareTransportEmissions(distanceKm, currentMode, alternativeMode, daysPerWeek);
  }, [distanceKm, currentMode, alternativeMode, daysPerWeek]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 relative overflow-hidden bg-gradient-to-r from-midnight-900 via-midnight-950 to-midnight-900">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-3">
            <Compass className="w-3.5 h-3.5" />
            <span>Safer Commute Planner • Sample City Routes ({currentCity})</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Safer Routes &amp; Lower-Pollution Travel
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-3xl">
            Compare routes by travel time or cleaner air—helping walkers, cyclists, and commuters choose tree-lined streets or metro travel away from heavy diesel traffic.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 border-t border-white/10 pt-4 mt-6">
          <button
            onClick={() => setActiveTab('routing')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'routing'
                ? 'bg-cyan-500 text-midnight-950 font-bold shadow-glow-cyan'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Clean Corridor Route Planner (Dijkstra)</span>
          </button>
          <button
            onClick={() => setActiveTab('lifecycle')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'lifecycle'
                ? 'bg-cyan-500 text-midnight-950 font-bold shadow-glow-cyan'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Bike className="w-4 h-4" />
            <span>Well-to-Wheel Lifecycle Offsets</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Clean Corridor Dijkstra Router */}
      {activeTab === 'routing' && (
        <div className="space-y-6">
          {/* Scientific Separation Alert */}
          <div className="p-4 rounded-xl bg-midnight-900/60 border border-white/10 text-xs flex items-start space-x-3 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-white block">Physical Distinction: Emissions vs. Ambient vs. Inhaled Dose</span>
              <p className="text-[11px] leading-relaxed text-slate-400">
                1) <strong className="text-emerald-400">Tailpipe Emissions</strong> (g CO₂e/km): Environmental burden generated by vehicle.  
                2) <strong className="text-amber-400">Corridor Ambient PM2.5</strong> (µg/m³): Trapped roadside concentration (e.g., highway canyons are 1.45x ambient, canopy greenways are 0.65x ambient).  
                3) <strong className="text-teal-400">Inhaled Dose</strong> (µg): Actual toxic mass entering lungs based on respiration rate and cabin filtration (Metro: 85% filtration, Walking: 0% filtration).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Col: Router Parameters */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-midnight-900/40 space-y-5 h-fit text-xs">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>Commute Settings</span>
              </h3>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Origin Node</label>
                <select
                  value={originId}
                  onChange={(e) => setOriginId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-midnight-950 border border-white/10 text-white"
                >
                  {Object.values(URBAN_NODES).map(n => (
                    <option key={n.id} value={n.id}>{n.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Destination Node</label>
                <select
                  value={destinationId}
                  onChange={(e) => setDestinationId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-midnight-950 border border-white/10 text-white"
                >
                  {Object.values(URBAN_NODES).map(n => (
                    <option key={n.id} value={n.id}>{n.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Baseline Travel Mode</label>
                <select
                  value={preferredMode}
                  onChange={(e) => setPreferredMode(e.target.value as TransportMode)}
                  className="w-full px-3 py-2 rounded-lg bg-midnight-950 border border-white/10 text-white"
                >
                  <option value="PETROL_CAR">Petrol Car (Solo Commute)</option>
                  <option value="DIESEL_CAR">Diesel Car</option>
                  <option value="EV_CAR">Electric Vehicle (EV)</option>
                  <option value="MOTORCYCLE">Two-Wheeler Motorcycle</option>
                  <option value="BUS">Public Transit Bus</option>
                  <option value="METRO_RAIL">Metro Rail</option>
                  <option value="CYCLING">Bicycle</option>
                  <option value="WALKING">Walking</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Optimization Strategy</label>
                <select
                  value={optimizationGoal}
                  onChange={(e) => setOptimizationGoal(e.target.value as 'LOWEST_EXPOSURE' | 'SHORTEST_TIME' | 'BALANCED')}
                  className="w-full px-3 py-2 rounded-lg bg-midnight-950 border border-white/10 text-white"
                >
                  <option value="LOWEST_EXPOSURE">Lowest Inhaled Particulate Dose</option>
                  <option value="SHORTEST_TIME">Fastest Travel Time</option>
                  <option value="BALANCED">Balanced Time & Exposure</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-300 font-medium">Ambient Regional PM2.5:</span>
                  <span className="font-mono text-cyan-400 font-bold">{ambientPm25} µg/m³</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="450"
                  step="10"
                  value={ambientPm25}
                  onChange={(e) => setAmbientPm25(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>
            </div>

            {/* Right 2 Cols: Evaluated Route Options */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Layers className="w-4 h-4 text-teal-400" />
                <span>Evaluated Multi-Modal Corridor Paths</span>
              </h3>

              <div className="space-y-4">
                {routeEvaluations.map(route => (
                  <RouteEvaluationCard key={route.id} route={route} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Well-to-Wheel Lifecycle Emissions */}
      {activeTab === 'lifecycle' && (
        <LifecycleComparisonTab
          distanceKm={distanceKm}
          onDistanceChange={setDistanceKm}
          currentMode={currentMode}
          onCurrentModeChange={setCurrentMode}
          alternativeMode={alternativeMode}
          onAlternativeModeChange={setAlternativeMode}
          daysPerWeek={daysPerWeek}
          onDaysPerWeekChange={setDaysPerWeek}
          emissionsComparison={emissionsComparison}
        />
      )}
    </div>
  );
};
