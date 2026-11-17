import React from 'react';
import { Wind, Shield, Activity, MapPin, AlertCircle } from 'lucide-react';
import { AQIStandard } from '../../domain/types';

interface NavbarProps {
  currentView: 'landing' | 'dashboard' | 'methodology';
  onNavigate: (view: 'landing' | 'dashboard' | 'methodology') => void;
  standard: AQIStandard;
  onStandardChange: (standard: AQIStandard) => void;
  isSampleData: boolean;
  selectedCity: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  standard,
  onStandardChange,
  isSampleData,
  selectedCity,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/10 bg-midnight-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <button 
          onClick={() => onNavigate('landing')}
          className="flex items-center space-x-3 text-left focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded-lg p-1"
          aria-label="VayuSenseX Home"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center shadow-glow-cyan">
            <Wind className="w-6 h-6 text-midnight-950" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xl font-bold tracking-tight text-white">VayuSense<span className="text-cyan-400">X</span></span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 font-mono font-medium">v0.1</span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Urban Environmental Intelligence</p>
          </div>
        </button>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1" aria-label="Main Navigation">
          <button
            onClick={() => onNavigate('landing')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'landing'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
              currentView === 'dashboard'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Live Intelligence</span>
          </button>
          <button
            onClick={() => onNavigate('methodology')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
              currentView === 'methodology'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Calculations & Standards</span>
          </button>
        </nav>

        {/* Right Tools: AQI Standard Switcher & Status */}
        <div className="flex items-center space-x-3">
          {/* City Indicator */}
          <div className="hidden lg:flex items-center space-x-1 px-2.5 py-1 rounded-md bg-midnight-800 border border-white/5 text-xs text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>{selectedCity}</span>
          </div>

          {/* CPCB vs US EPA Standard Selector */}
          <div className="flex items-center bg-midnight-900 border border-white/10 rounded-lg p-0.5" role="group" aria-label="AQI Standard Selection">
            <button
              onClick={() => onStandardChange('CPCB')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                standard === 'CPCB'
                  ? 'bg-cyan-500 text-midnight-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Central Pollution Control Board (India NAQI)"
            >
              CPCB (India)
            </button>
            <button
              onClick={() => onStandardChange('USEPA')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                standard === 'USEPA'
                  ? 'bg-cyan-500 text-midnight-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="US Environmental Protection Agency"
            >
              US EPA
            </button>
          </div>

          {/* Sample Mode Indicator */}
          {isSampleData && (
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-950/60 border border-amber-800/50 text-amber-300" title="Running in verified simulation mode">
              <AlertCircle className="w-3 h-3 mr-1 text-amber-400" />
              Sample Mode
            </span>
          )}

          {/* Mobile Action */}
          <button
            onClick={() => onNavigate('dashboard')}
            className="md:hidden p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
            aria-label="Open Dashboard"
          >
            <Activity className="w-5 h-5" />
          </button>
        </div>

      </div>
    </header>
  );
};
