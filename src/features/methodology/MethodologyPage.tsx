import React from 'react';
import { BookOpen, Scale, Cpu, Activity, Home } from 'lucide-react';

export const MethodologyPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800/60 text-cyan-300 text-xs font-mono mb-3">
          <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
          <span>Scientific Transparency & Auditability</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
          Calculations, Standards & Scientific Methodology
        </h1>
        <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-3xl leading-relaxed">
          VayuSenseX separates deterministic mathematical formulas from generative AI. 
          Every number displayed in this application is calculated using verified environmental engineering equations and published government standards.
        </p>
      </div>

      {/* Grid of Methodologies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Method 1: CPCB vs US EPA AQI */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center space-x-3 text-cyan-400">
            <Scale className="w-5 h-5" />
            <h2 className="text-lg font-bold text-white">1. Dual AQI Calculation (CPCB vs US EPA)</h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Many applications mistakenly interchange US EPA and Indian CPCB AQI. In severe winter smog conditions (e.g. Indo-Gangetic Plains), breakpoints differ dramatically. VayuSenseX implements independent sub-index interpolations:
          </p>
          <div className="p-3.5 rounded-xl bg-midnight-950 border border-white/10 font-mono text-xs text-cyan-300">
            I_p = [ (I_hi - I_lo) / (B_hi - B_lo) ] * (C_p - B_lo) + I_lo
          </div>
          <p className="text-[11px] text-slate-400">
            Where <em>C_p</em> is the pollutant concentration, <em>B_lo</em> and <em>B_hi</em> are the concentration breakpoints, and <em>I_lo</em> and <em>I_hi</em> are the corresponding index thresholds. Overall AQI is the maximum of all computed sub-indices.
          </p>
        </div>

        {/* Method 2: Atmospheric Stagnation & Inversion */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center space-x-3 text-teal-400">
            <Activity className="w-5 h-5" />
            <h2 className="text-lg font-bold text-white">2. Boundary Layer & Smog Inversion Heuristics</h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            During winter, thermal radiation loss creates a nocturnal ground-level inversion. We assess dispersion capacity using planetary boundary layer height (PBLH) and wind velocity:
          </p>
          <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
            <li><strong>Critical Stagnation:</strong> PBLH &lt; 250m and Wind &lt; 5 km/h (severe accumulation).</li>
            <li><strong>Moderate Mixing:</strong> PBLH between 250m and 600m.</li>
            <li><strong>Favorable Dispersion:</strong> PBLH &gt; 600m and Wind &gt; 12 km/h.</li>
          </ul>
        </div>

        {/* Method 3: Inhaled Particulate Dose */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center space-x-3 text-rose-400">
            <Cpu className="w-5 h-5" />
            <h2 className="text-lg font-bold text-white">3. Modelled Inhaled Particulate Dose</h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Based on the US EPA Exposure Factors Handbook, inhaled dose <em>D</em> (µg) is calculated as:
          </p>
          <div className="p-3.5 rounded-xl bg-midnight-950 border border-white/10 font-mono text-xs text-rose-300">
            D = Σ ( C_t × BR_t × Δt )
          </div>
          <p className="text-[11px] text-slate-400">
            Where <em>BR_t</em> is the breathing rate by activity: Rest (0.45 m³/h), Light exertion (0.9 m³/h), Heavy exercise (2.1 m³/h). Labelled strictly as an exposure estimate, not a clinical prognosis.
          </p>
        </div>

        {/* Method 4: Indoor Mass-Balance & CADR */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center space-x-3 text-emerald-400">
            <Home className="w-5 h-5" />
            <h2 className="text-lg font-bold text-white">4. Indoor Single-Zone Mass-Balance Model</h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Dynamic indoor particulate concentration satisfies the first-order differential equation:
          </p>
          <div className="p-3.5 rounded-xl bg-midnight-950 border border-white/10 font-mono text-xs text-emerald-300">
            dC_in/dt = P·λ·C_out + (S/V) - [λ + k + (η·Q/V)] · C_in
          </div>
          <p className="text-[11px] text-slate-400">
            Purifier sizing targets 5 Air Changes per Hour (ACH): <em>CADR_required = Room Volume (m³) × 5</em>.
          </p>
        </div>

      </div>

      {/* Citations and Official Authorities */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10">
        <h3 className="text-base font-bold text-white mb-4">Official Standards & Data Citations</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-midnight-950 border border-white/5">
            <strong className="text-slate-200">CPCB India NAQI</strong>
            <p className="text-slate-400 mt-1">Ministry of Environment, Forest and Climate Change, Govt of India (2015).</p>
          </div>
          <div className="p-3 rounded-xl bg-midnight-950 border border-white/5">
            <strong className="text-slate-200">US EPA 454/B-18-007</strong>
            <p className="text-slate-400 mt-1">Technical Assistance Document for Reporting Daily Air Quality (2024 revisions).</p>
          </div>
          <div className="p-3 rounded-xl bg-midnight-950 border border-white/5">
            <strong className="text-slate-200">Open-Meteo & CAMS</strong>
            <p className="text-slate-400 mt-1">Copernicus Atmosphere Monitoring Service European air quality forecasting models.</p>
          </div>
          <div className="p-3 rounded-xl bg-midnight-950 border border-white/5">
            <strong className="text-slate-200">WHO Guidelines</strong>
            <p className="text-slate-400 mt-1">Global Air Quality Guidelines (AQGs) for particulate matter and toxic gases.</p>
          </div>
        </div>
      </div>

    </div>
  );
};
