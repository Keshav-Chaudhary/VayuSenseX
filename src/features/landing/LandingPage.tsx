import React from 'react';
import { 
  Wind, 
  Home, 
  Activity, 
  ArrowRight, 
  Sliders, 
  CheckCircle2, 
  Sparkles, 
  Layers,
  Gauge
} from 'lucide-react';
import { EnvironmentalSnapshot, AQIStandard } from '../../domain/types';

interface LandingPageProps {
  onEnterDashboard: () => void;
  snapshot: EnvironmentalSnapshot;
  standard: AQIStandard;
  onStandardChange: (standard: AQIStandard) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterDashboard,
  snapshot,
  standard,
  onStandardChange,
}) => {
  const aqiResult = standard === 'CPCB' ? snapshot.cpcbAqi : snapshot.usEpaAqi;

  return (
    <div className="relative overflow-hidden">
      {/* Background atmospheric gradient & subtle grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800/60 text-cyan-300 text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>AI-Powered Urban Environmental Intelligence</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                Understand the air. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
                  Protect your world.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                Navigate severe winter smog and urban air pollution with a scientifically grounded decision platform. 
                VayuSenseX connects live atmospheric forecasts, household sensitivity, indoor mass-balance filtration, and sustainable alternatives into actionable family routines.
              </p>

              {/* Core Philosophy Badge */}
              <div className="p-3.5 rounded-xl bg-midnight-900/90 border border-white/10 text-xs text-slate-400 flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>
                  <strong className="text-slate-200">The VayuSenseX Philosophy:</strong> The deterministic engine owns the calculations. AI owns the explanations. The user owns the decisions.
                </span>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
                <button
                  onClick={onEnterDashboard}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-midnight-950 font-bold text-sm shadow-glow-cyan hover:opacity-95 transition-all flex items-center justify-center space-x-2 group"
                >
                  <span>Launch Live Intelligence</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById('features-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-6 py-3.5 rounded-xl bg-midnight-800 hover:bg-midnight-700 border border-white/10 text-slate-200 font-semibold text-sm transition-all text-center"
                >
                  Explore Capabilities
                </button>
              </div>

              {/* Key Features Bullet List */}
              <div className="grid grid-cols-2 gap-3 pt-4 text-xs text-slate-400">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>CPCB & US EPA Dual Standards</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Atmospheric Inversion Detection</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Indoor Single-Zone Mass Balance</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>What-If Scenario Simulation</span>
                </div>
              </div>

            </div>

            {/* Right Hero Live Interactive Atmospheric Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl glass-panel p-6 border border-white/15 shadow-glass">
                
                {/* Header of preview card */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div>
                    <span className="text-xs font-mono uppercase text-cyan-400 tracking-wider">Atmospheric Telemetry</span>
                    <h3 className="text-lg font-bold text-white">{snapshot.location.city}</h3>
                    <p className="text-xs text-slate-400">{snapshot.location.area}</p>
                  </div>
                  
                  {/* Standard toggle inside card */}
                  <div className="flex items-center bg-midnight-950 p-1 rounded-lg border border-white/10 text-[11px]">
                    <button
                      onClick={() => onStandardChange('CPCB')}
                      className={`px-2 py-0.5 rounded font-medium ${standard === 'CPCB' ? 'bg-cyan-500 text-midnight-950 font-bold' : 'text-slate-400'}`}
                    >
                      CPCB
                    </button>
                    <button
                      onClick={() => onStandardChange('USEPA')}
                      className={`px-2 py-0.5 rounded font-medium ${standard === 'USEPA' ? 'bg-cyan-500 text-midnight-950 font-bold' : 'text-slate-400'}`}
                    >
                      US EPA
                    </button>
                  </div>
                </div>

                {/* AQI Value Display */}
                <div className="py-6 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400">Current Computed Index ({standard})</span>
                    <div className="flex items-baseline space-x-2 mt-1">
                      <span className="text-6xl font-black font-mono tracking-tight" style={{ color: aqiResult.categoryColor }}>
                        {aqiResult.aqi}
                      </span>
                      <span className="text-xs text-slate-400">/ 500</span>
                    </div>
                    <div 
                      className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider"
                      style={{ 
                        backgroundColor: `${aqiResult.categoryColor}20`,
                        color: aqiResult.categoryColor,
                        border: `1px solid ${aqiResult.categoryColor}50`
                      }}
                    >
                      {aqiResult.categoryLabel}
                    </div>
                  </div>

                  {/* Dominant Pollutant */}
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Dominant Driver</span>
                    <p className="text-2xl font-bold font-mono text-cyan-300 uppercase mt-1">
                      {aqiResult.dominantPollutant.toUpperCase()}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {snapshot.pollutants.pm25} µg/m³
                    </p>
                  </div>
                </div>

                {/* Atmospheric Stagnation & Boundary Layer Bar */}
                <div className="p-3 rounded-xl bg-midnight-900/80 border border-white/5 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="flex items-center space-x-1.5">
                      <Layers className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Boundary Layer Height:</span>
                    </span>
                    <span className="font-mono font-bold text-amber-300">
                      {snapshot.weather.boundaryLayerHeight} m (Inversion)
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="flex items-center space-x-1.5">
                      <Wind className="w-3.5 h-3.5 text-teal-400" />
                      <span>Surface Wind:</span>
                    </span>
                    <span className="font-mono text-slate-200">
                      {snapshot.weather.windSpeed} km/h (Stagnant)
                    </span>
                  </div>
                </div>

                {/* Card CTA */}
                <button
                  onClick={onEnterDashboard}
                  className="w-full mt-5 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <span>Open Full Environmental Telemetry & Planner</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 4 Architectural Pillars Section */}
      <section id="features-section" className="py-20 border-t border-white/5 bg-midnight-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-2">Scientific Architecture</h2>
            <p className="text-3xl font-bold text-white sm:text-4xl">
              Engineering Beyond a Simple Chatbot
            </p>
            <p className="text-sm text-slate-400 mt-3">
              VayuSenseX separates deterministic mathematical models from generative explanations to guarantee reliability, zero hallucinated measurements, and actionable household impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Pillar 1 */}
            <div className="glass-panel rounded-2xl p-6 glass-card-hover border border-white/10 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-5 text-cyan-400">
                  <Gauge className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Atmospheric Intelligence</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Real-time CPCB (India) and US EPA multi-pollutant indices, atmospheric inversion heuristics, and boundary layer stagnation tracking.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-cyan-400 flex items-center">
                <span>Module A & B Engine</span>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="glass-panel rounded-2xl p-6 glass-card-hover border border-white/10 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center mb-5 text-teal-400">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Cleanest-Hour Planner</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Mathematical schedule optimization respecting school, work, and sensitive family members (asthma, elderly, toddlers) to minimize inhaled dose.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-teal-400 flex items-center">
                <span>D = Σ(C_t · BR_t · Δt)</span>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="glass-panel rounded-2xl p-6 glass-card-hover border border-white/10 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-5 text-emerald-400">
                  <Home className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Indoor Mass-Balance</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Room volume CADR sizing, DIY box-fan filtration blueprints, particle penetration mechanics, and optimal ventilation timing windows.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-emerald-400 flex items-center">
                <span>dC_in/dt ODE Solver</span>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="glass-panel rounded-2xl p-6 glass-card-hover border border-white/10 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-5 text-amber-400">
                  <Sliders className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">What-If Simulation</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Simulate alternative household routines, commute shifts (metro vs car), and filtration runtimes with quantifiable particulate and CO₂e offsets.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-amber-400 flex items-center">
                <span>Cumulative Impact Ledger</span>
              </div>
            </div>

          </div>

        </div>
      </section>
    </div>
  );
};
