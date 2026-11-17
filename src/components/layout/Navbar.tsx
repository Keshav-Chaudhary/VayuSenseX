import React from 'react';
import { Wind, Shield, Activity, MapPin, AlertCircle, Home, Sliders, Bike, Users, Calendar, Bot } from 'lucide-react';
import { AQIStandard } from '../../domain/types';

export type ActiveNavView = 
  | 'landing'
  | 'dashboard'
  | 'household'
  | 'planner'
  | 'assistant'
  | 'indoor'
  | 'exposure'
  | 'mobility'
  | 'simulator'
  | 'methodology';

interface NavbarProps {
  currentView: ActiveNavView;
  onNavigate: (view: ActiveNavView) => void;
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
          className="flex items-center space-x-3 text-left focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded-lg p-1 shrink-0"
          aria-label="VayuSenseX Home"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center shadow-glow-cyan">
            <Wind className="w-6 h-6 text-midnight-950" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xl font-bold tracking-tight text-white">VayuSense<span className="text-cyan-400">X</span></span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 font-mono font-medium">v1.0</span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Urban Environmental Intelligence</p>
          </div>
        </button>

        {/* Center Navigation Links */}
        <nav className="hidden 2xl:flex items-center space-x-1" aria-label="Main Navigation">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
              currentView === 'dashboard'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Atmosphere</span>
          </button>

          <button
            onClick={() => onNavigate('household')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
              currentView === 'household'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-teal-400" />
            <span>Household</span>
          </button>

          <button
            onClick={() => onNavigate('planner')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
              currentView === 'planner'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>Daily Planner</span>
          </button>

          <button
            onClick={() => onNavigate('assistant')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
              currentView === 'assistant'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-teal-300" />
            <span>AI Assistant</span>
          </button>

          <button
            onClick={() => onNavigate('indoor')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
              currentView === 'indoor'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Indoor CADR</span>
          </button>

          <button
            onClick={() => onNavigate('exposure')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
              currentView === 'exposure'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-teal-400" />
            <span>Inhaled Dose</span>
          </button>

          <button
            onClick={() => onNavigate('mobility')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
              currentView === 'mobility'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Bike className="w-3.5 h-3.5 text-emerald-400" />
            <span>Mobility</span>
          </button>

          <button
            onClick={() => onNavigate('simulator')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
              currentView === 'simulator'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulator</span>
          </button>

          <button
            onClick={() => onNavigate('methodology')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
              currentView === 'methodology'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Standards</span>
          </button>
        </nav>

        {/* Right Tools: AQI Standard Switcher & Status */}
        <div className="flex items-center space-x-3">
          {/* City Indicator */}
          <div className="hidden lg:flex items-center space-x-1 px-2.5 py-1 rounded-md bg-midnight-800 border border-white/5 text-xs text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span className="truncate max-w-[120px]">{selectedCity}</span>
          </div>

          {/* CPCB vs US EPA Standard Selector */}
          <div className="flex items-center bg-midnight-900 border border-white/10 rounded-lg p-0.5" role="group" aria-label="AQI Standard Selection">
            <button
              onClick={() => onStandardChange('CPCB')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                standard === 'CPCB'
                  ? 'bg-cyan-500 text-midnight-950 shadow-sm font-bold'
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
                  ? 'bg-cyan-500 text-midnight-950 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="US Environmental Protection Agency"
            >
              US EPA
            </button>
          </div>

          {/* Sample Mode Indicator */}
          {isSampleData && (
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-950/60 border border-amber-800/50 text-amber-300" title="Running in calibrated simulation mode">
              <AlertCircle className="w-3 h-3 mr-1 text-amber-400" />
              Demo
            </span>
          )}

          {/* Mobile Menu Action */}
          <button
            onClick={() => onNavigate('dashboard')}
            className="xl:hidden p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
            aria-label="Open Atmospheric Dashboard"
          >
            <Activity className="w-5 h-5" />
          </button>
        </div>

      </div>

      {/* Sub-navigation bar for smaller screens */}
      <div className="2xl:hidden flex items-center space-x-1 px-4 py-2 border-t border-white/5 overflow-x-auto bg-midnight-950/95 scrollbar-none text-xs">
        <button
          onClick={() => onNavigate('dashboard')}
          className={`px-2.5 py-1 rounded-md shrink-0 ${currentView === 'dashboard' ? 'text-cyan-400 font-bold bg-cyan-950' : 'text-slate-400'}`}
        >
          Atmosphere
        </button>
        <button
          onClick={() => onNavigate('household')}
          className={`px-2.5 py-1 rounded-md shrink-0 ${currentView === 'household' ? 'text-cyan-400 font-bold bg-cyan-950' : 'text-slate-400'}`}
        >
          Household
        </button>
        <button
          onClick={() => onNavigate('planner')}
          className={`px-2.5 py-1 rounded-md shrink-0 ${currentView === 'planner' ? 'text-cyan-400 font-bold bg-cyan-950' : 'text-slate-400'}`}
        >
          Daily Planner
        </button>
        <button
          onClick={() => onNavigate('assistant')}
          className={`px-2.5 py-1 rounded-md shrink-0 ${currentView === 'assistant' ? 'text-cyan-400 font-bold bg-cyan-950' : 'text-slate-400'}`}
        >
          AI Assistant
        </button>
        <button
          onClick={() => onNavigate('indoor')}
          className={`px-2.5 py-1 rounded-md shrink-0 ${currentView === 'indoor' ? 'text-cyan-400 font-bold bg-cyan-950' : 'text-slate-400'}`}
        >
          Indoor CADR
        </button>
        <button
          onClick={() => onNavigate('exposure')}
          className={`px-2.5 py-1 rounded-md shrink-0 ${currentView === 'exposure' ? 'text-cyan-400 font-bold bg-cyan-950' : 'text-slate-400'}`}
        >
          Inhaled Dose
        </button>
        <button
          onClick={() => onNavigate('mobility')}
          className={`px-2.5 py-1 rounded-md shrink-0 ${currentView === 'mobility' ? 'text-cyan-400 font-bold bg-cyan-950' : 'text-slate-400'}`}
        >
          Mobility
        </button>
        <button
          onClick={() => onNavigate('simulator')}
          className={`px-2.5 py-1 rounded-md shrink-0 ${currentView === 'simulator' ? 'text-cyan-400 font-bold bg-cyan-950' : 'text-slate-400'}`}
        >
          Simulator
        </button>
        <button
          onClick={() => onNavigate('methodology')}
          className={`px-2.5 py-1 rounded-md shrink-0 ${currentView === 'methodology' ? 'text-cyan-400 font-bold bg-cyan-950' : 'text-slate-400'}`}
        >
          Standards
        </button>
      </div>
    </header>
  );
};
