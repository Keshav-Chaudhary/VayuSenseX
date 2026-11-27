import React, { useState, useEffect } from 'react';
import {
  Wind,
  Activity,
  Users,
  Calendar,
  Bot,
  Home,
  Bike,
  Layers,
  HeartHandshake,
  Sliders,
  Shield,
  Menu,
  X,
  MapPin,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import { ActiveNavView } from './Navbar';
import { AQIStandard } from '../../domain/types';

interface WorkspaceNavigationProps {
  currentView: ActiveNavView;
  onNavigate: (view: ActiveNavView) => void;
  standard: AQIStandard;
  onStandardChange: (standard: AQIStandard) => void;
  isSampleData: boolean;
  selectedCity: string;
}

export interface WorkspaceTab {
  readonly id: ActiveNavView;
  readonly label: string;
  readonly icon: React.ElementType;
}

export const WORKSPACE_TABS: readonly WorkspaceTab[] = [
  { id: 'dashboard', label: 'Air Quality', icon: Activity },
  { id: 'household', label: 'My Family', icon: Users },
  { id: 'planner', label: 'Daily Plan', icon: Calendar },
  { id: 'assistant', label: 'Ask AI', icon: Bot },
  { id: 'indoor', label: 'Clean Home Air', icon: Home },
  { id: 'exposure', label: 'Breathing Risk', icon: Activity },
  { id: 'mobility', label: 'Safer Routes', icon: Bike },
  { id: 'impact', label: 'My Impact', icon: Layers },
  { id: 'community', label: 'Neighborhood', icon: HeartHandshake },
  { id: 'simulator', label: 'What-If Tool', icon: Sliders },
  { id: 'methodology', label: 'How It Works', icon: Shield },
] as const;

export const WorkspaceNavigation: React.FC<WorkspaceNavigationProps> = ({
  currentView,
  onNavigate,
  standard,
  onStandardChange,
  isSampleData,
  selectedCity,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <div className="border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-md px-4 py-3 sm:px-6 lg:px-8 space-y-3">
      {/* Workspace Brand Bar & Master Controls */}
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Link to Return Home */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('landing')}
            className="text-[var(--fg)] hover:text-[var(--accent)] inline-flex items-center gap-2 font-bold no-underline transition-colors focus-visible:outline-none"
            title="Return to Home Overview"
          >
            <span
              aria-hidden="true"
              className="border border-[var(--accent-line)] bg-[var(--accent-subtle)] text-[var(--accent)] flex size-7 items-center justify-center rounded-full shadow-xs"
            >
              <Wind className="text-[var(--accent)] size-3.5" />
            </span>
            <span className="text-sm font-extrabold tracking-tight">
              VayuSense<span className="text-[var(--accent)]">X</span>
              <span className="text-[var(--fg-muted)] ml-2 text-xs font-normal hidden sm:inline">
                / Family Clean Air Guide
              </span>
            </span>
          </button>

          <button
            onClick={() => onNavigate('landing')}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--fg-subtle)] hover:text-[var(--accent)] transition-colors px-2 py-0.5 rounded-md hover:bg-[var(--surface-2)]"
          >
            <ArrowLeft className="size-3" />
            <span className="hidden sm:inline">Home</span>
          </button>
        </div>

        {/* Right Tools: City, Standard Selector & Demo Badge */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* City Indicator */}
          <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--surface-2)] border border-[var(--border)] text-xs text-[var(--fg-muted)]">
            <MapPin className="size-3.5 text-[var(--accent)]" />
            <span className="truncate max-w-[130px] font-medium">{selectedCity}</span>
          </div>

          {/* CPCB vs US EPA Standard Selector */}
          <div
            className="flex items-center bg-[var(--surface-2)] border border-[var(--border)] rounded-full p-0.5 text-xs"
            role="group"
            aria-label="AQI Standard Selection"
          >
            <button
              onClick={() => onStandardChange('CPCB')}
              aria-pressed={standard === 'CPCB'}
              className={`rounded-full px-2.5 py-1 font-bold text-[11px] transition-all ${
                standard === 'CPCB'
                  ? 'bg-[var(--accent)] text-white shadow-xs'
                  : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
              }`}
              title="Central Pollution Control Board (India NAQI)"
            >
              CPCB
            </button>
            <button
              onClick={() => onStandardChange('USEPA')}
              aria-pressed={standard === 'USEPA'}
              className={`rounded-full px-2.5 py-1 font-bold text-[11px] transition-all ${
                standard === 'USEPA'
                  ? 'bg-[var(--accent)] text-white shadow-xs'
                  : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
              }`}
              title="US Environmental Protection Agency"
            >
              US EPA
            </button>
          </div>

          {/* Calibrated Demo Badge */}
          {isSampleData && (
            <span
              className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--caution-subtle)] border border-[var(--caution-subtle)] text-[var(--caution)]"
              title="Running in calibrated simulation mode"
            >
              <AlertCircle className="size-3" />
              Demo
            </span>
          )}

          {/* Mobile Drawer Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle Workspace Menu"
            className="2xl:hidden bg-[var(--surface-2)] text-[var(--fg)] inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[var(--border-strong)] px-3 py-1.5 text-xs font-bold shadow-xs hover:border-[var(--accent-line)]"
          >
            {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            <span className="text-xs">Workbenches</span>
          </button>
        </div>
      </div>

      {/* Segmented Tab Row (Desktop) & Collapsible Drawer (Mobile) */}
      <div className="max-w-7xl mx-auto">
        <nav
          aria-label="Workspace Sections Navigation"
          className={`bg-[var(--surface-2)]/90 flex flex-col 2xl:flex-row 2xl:flex-wrap items-stretch 2xl:items-center gap-1 rounded-2xl border border-[var(--border)] p-1.5 shadow-[var(--shadow-sm)] backdrop-blur-md transition-all ${
            mobileMenuOpen ? 'flex' : 'hidden 2xl:flex'
          }`}
        >
          {WORKSPACE_TABS.map((tab) => {
            const isActive = currentView === tab.id;
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => {
                  onNavigate(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[var(--accent)] text-white shadow-[0_0_12px_var(--accent-line)] shadow-xs'
                    : 'text-[var(--fg-muted)] hover:bg-[var(--surface-3)] hover:text-[var(--fg)]'
                }`}
              >
                <IconComponent className="size-3.5 shrink-0" aria-hidden="true" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
