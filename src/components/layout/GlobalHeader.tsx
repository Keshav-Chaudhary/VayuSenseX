import React from 'react';
import { Wind, ArrowRight, ShieldCheck } from 'lucide-react';
import { AQIStandard } from '../../domain/types';

interface GlobalHeaderProps {
  onEnterDashboard: () => void;
  standard: AQIStandard;
  onStandardChange: (standard: AQIStandard) => void;
  onNavigateMethodology: () => void;
}

export const GlobalHeader: React.FC<GlobalHeaderProps> = ({
  onEnterDashboard,
  standard,
  onStandardChange,
  onNavigateMethodology,
}) => {
  return (
    <div className="pointer-events-none fixed top-4 right-0 left-0 z-50 flex justify-center px-4">
      <header
        role="banner"
        className="bg-[var(--surface)]/85 hover:bg-[var(--surface)]/95 pointer-events-auto flex w-full max-w-5xl items-center justify-between rounded-full border border-[var(--border)] px-3 py-2 shadow-[var(--shadow-md)] backdrop-blur-md transition-all hover:border-[var(--accent-line)] sm:px-5 sm:py-2.5"
      >
        {/* Left: Brand Logo & Navigation Links */}
        <div className="flex items-center gap-3 sm:gap-6">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex cursor-pointer items-center gap-2.5 font-bold no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded-full"
            aria-label="VayuSenseX Home"
          >
            <span
              aria-hidden="true"
              className="flex size-7 items-center justify-center rounded-full border border-[var(--accent-line)] bg-[var(--accent-subtle)] text-[var(--accent)] shadow-xs sm:size-8"
            >
              <Wind className="size-4 text-[var(--accent)]" />
            </span>
            <span className="text-[var(--fg)] text-base font-extrabold tracking-tight sm:text-lg">
              VayuSense<span className="text-[var(--accent)]">X</span>
            </span>
          </button>

          {/* Navigation Links */}
          <nav aria-label="Main Navigation" className="flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="rounded-full px-2.5 py-1 text-xs font-bold transition-all sm:px-4 sm:py-2 sm:text-sm bg-[var(--accent)] text-white shadow-xs"
            >
              Overview
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('features-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hidden md:inline-flex rounded-full px-2.5 py-1 text-xs font-bold transition-all sm:px-4 sm:py-2 sm:text-sm text-[var(--fg-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--fg)]"
            >
              Features
            </button>
            <button
              onClick={onNavigateMethodology}
              className="hidden md:inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold transition-all sm:px-4 sm:py-2 sm:text-sm text-[var(--fg-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--fg)]"
            >
              <ShieldCheck className="size-3.5 text-emerald-400" />
              <span>How It Works</span>
            </button>
          </nav>
        </div>

        {/* Right: AQI Standard Selector & Launch Workspace CTA */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* CPCB / US EPA Switcher Pill */}
          <div
            className="flex items-center bg-[var(--surface-2)] border border-[var(--border)] rounded-full p-0.5 text-xs"
            role="group"
            aria-label="AQI Standard Selection"
          >
            <button
              onClick={() => onStandardChange('CPCB')}
              aria-pressed={standard === 'CPCB'}
              className={`rounded-full px-2 sm:px-3 py-1 font-bold text-[11px] sm:text-xs transition-all ${
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
              className={`rounded-full px-2 sm:px-3 py-1 font-bold text-[11px] sm:text-xs transition-all ${
                standard === 'USEPA'
                  ? 'bg-[var(--accent)] text-white shadow-xs'
                  : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
              }`}
              title="US Environmental Protection Agency"
            >
              US EPA
            </button>
          </div>

          {/* Launch CTA */}
          <button
            onClick={onEnterDashboard}
            id="nav-workspace-cta"
            className="group flex h-9 items-center justify-center gap-1.5 rounded-full bg-[var(--accent)] px-3.5 text-xs font-bold whitespace-nowrap text-white shadow-xs transition-all hover:-translate-y-0.5 hover:bg-[var(--accent-strong)] hover:shadow-[0_0_16px_var(--accent-line)] sm:h-10 sm:gap-2 sm:px-5 sm:text-sm"
          >
            <span className="hidden sm:inline">Check Your Air</span>
            <span className="sm:hidden">Start</span>
            <ArrowRight
              aria-hidden="true"
              className="size-3.5 transition-transform group-hover:translate-x-1 sm:size-4"
            />
          </button>
        </div>
      </header>
    </div>
  );
};
