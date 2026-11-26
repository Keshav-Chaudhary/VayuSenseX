import React from 'react';
import {
  Wind,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Layers,
} from 'lucide-react';
import { EnvironmentalSnapshot, AQIStandard } from '../../domain/types';
import { PillarGrid } from './PillarGrid';

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
    <div className="relative overflow-hidden bg-[var(--bg)] text-[var(--fg)] transition-colors duration-300">
      {/* Ambient background glow lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-12 right-1/4 -z-10 h-[520px] w-[620px] rounded-full bg-[var(--accent)] opacity-10 blur-[140px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-10 left-4 -z-10 h-[400px] w-[500px] rounded-full bg-teal-500/10 blur-[130px]"
      />
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 sm:pt-28 lg:pt-32 lg:pb-24">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Hero Content */}
            <div className="stagger flex flex-col justify-center lg:col-span-7 space-y-6">
              {/* Eyebrow Badge */}
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--accent-line)] bg-[var(--accent-subtle)] px-3 py-1 shadow-[0_0_15px_var(--accent-subtle)] backdrop-blur-md sm:px-3.5 sm:py-1.5">
                <Sparkles className="size-3.5 text-[var(--accent)]" />
                <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase sm:text-[11px]">
                  <span className="text-[var(--fg-muted)]">YOUR DAILY CLEAN AIR COMPANION</span>
                  <span className="text-[var(--accent)]">• MADE FOR FAMILIES</span>
                </div>
              </div>

              {/* Main Headline */}
              <h1 className="text-[var(--fg)] text-3xl leading-[1.08] font-black tracking-tight sm:text-5xl lg:text-5xl xl:text-[56px] 2xl:text-[64px]">
                Understand the air. <br />
                <span className="bg-gradient-to-r from-[var(--accent)] via-cyan-300 to-teal-300 bg-clip-text text-transparent">
                  Protect your world.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[var(--fg-muted)] max-w-2xl leading-relaxed">
                Severe winter smog and city pollution can be stressful and confusing. VayuSenseX turns live air quality forecasts into clear, personalized daily advice—helping you pick the safest times to go outside, keep your indoor air clean, and plan healthier commutes.
              </p>

              {/* Plain-Language Promise Card */}
              <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] shadow-[var(--shadow-sm)] text-xs text-[var(--fg-muted)] flex items-start gap-3">
                <div className="size-2.5 rounded-full bg-[var(--accent)] mt-1 animate-pulse shrink-0" />
                <span className="leading-relaxed">
                  <strong className="text-[var(--fg)] font-bold">How VayuSenseX Helps:</strong> Trusted weather and air data handle the math, our AI explains it in plain words, and you stay in charge of your family&apos;s routine.
                </span>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <button
                  onClick={onEnterDashboard}
                  id="hero-launch-btn"
                  className="group flex h-11 sm:h-12 items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-6 sm:px-8 text-sm sm:text-base font-bold whitespace-nowrap text-white shadow-xs transition-all hover:-translate-y-0.5 hover:bg-[var(--accent-strong)] hover:shadow-[0_0_20px_var(--accent-line)]"
                >
                  <span>Check Live Air Quality</span>
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById('features-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex h-11 sm:h-12 items-center justify-center rounded-full bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--border-strong)] px-6 sm:px-8 text-sm sm:text-base font-semibold text-[var(--fg)] shadow-xs transition-all"
                >
                  See What It Can Do
                </button>
              </div>

              {/* Key Benefits List */}
              <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-[var(--fg-muted)] font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[var(--accent)] shrink-0" />
                  <span>India (CPCB) &amp; US Air Scales</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[var(--accent)] shrink-0" />
                  <span>Trapped Smog Alerts</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[var(--accent)] shrink-0" />
                  <span>Room Purifier &amp; DIY Filter Guide</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[var(--accent)] shrink-0" />
                  <span>Compare Safer Daily Habits</span>
                </div>
              </div>
            </div>

            {/* Right Hero Live Interactive Air Quality Card */}
            <div className="lg:col-span-5">
              <div className="group bg-[var(--surface-2)] text-[var(--fg)] relative overflow-hidden rounded-3xl border border-[var(--border)] p-6 sm:p-7 shadow-[var(--shadow-md)] transition-all hover:border-[var(--accent-line)]">
                <div
                  aria-hidden="true"
                  className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-[var(--accent-subtle)] blur-[70px] pointer-events-none"
                />

                <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
                  <div>
                    <span className="text-[11px] font-mono uppercase text-[var(--accent)] font-bold tracking-wider">
                      Live Air Check
                    </span>
                    <h3 className="text-xl font-black text-[var(--fg)] tracking-tight">{snapshot.location.city}</h3>
                    <p className="text-xs text-[var(--fg-subtle)]">{snapshot.location.area}</p>
                  </div>

                  {/* Standard toggle inside card */}
                  <div className="flex items-center bg-[var(--surface-3)] p-0.5 rounded-full border border-[var(--border)] text-xs">
                    <button
                      onClick={() => onStandardChange('CPCB')}
                      className={`px-2.5 py-1 rounded-full font-bold text-[11px] transition-all ${
                        standard === 'CPCB' ? 'bg-[var(--accent)] text-white shadow-xs' : 'text-[var(--fg-muted)]'
                      }`}
                    >
                      CPCB
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

                {/* AQI Value Display */}
                <div className="py-6 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-[var(--fg-subtle)] font-medium">Current Air Quality Score</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-6xl font-black font-mono tracking-tight tnum" style={{ color: aqiResult.categoryColor }}>
                        {aqiResult.aqi}
                      </span>
                      <span className="text-xs text-[var(--fg-subtle)] font-mono">/ 500</span>
                    </div>
                    <div
                      className="inline-block mt-2.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-xs"
                      style={{
                        backgroundColor: `${aqiResult.categoryColor}20`,
                        color: aqiResult.categoryColor,
                        border: `1px solid ${aqiResult.categoryColor}50`,
                      }}
                    >
                      {aqiResult.categoryLabel}
                    </div>
                  </div>

                  {/* Main Pollutant */}
                  <div className="text-right">
                    <span className="text-xs text-[var(--fg-subtle)] font-medium">Main Pollutant</span>
                    <p className="text-2xl font-bold font-mono text-[var(--accent)] uppercase mt-1">
                      {aqiResult.dominantPollutant.toUpperCase()}
                    </p>
                    <p className="text-xs text-[var(--fg-muted)] mt-1 font-mono">
                      {snapshot.pollutants.pm25} µg/m³
                    </p>
                  </div>
                </div>

                {/* Weather & Smog Trapping Summary */}
                <div className="p-3.5 rounded-2xl bg-[var(--surface-3)] border border-[var(--border)] space-y-2 text-xs">
                  <div className="flex justify-between items-center text-[var(--fg-muted)]">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Layers className="size-3.5 text-[var(--accent)]" />
                      <span>Smog Ceiling Height:</span>
                    </span>
                    <span className="font-mono font-bold text-amber-300">
                      {snapshot.weather.boundaryLayerHeight} m (Low Trap)
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[var(--fg-muted)]">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Wind className="size-3.5 text-teal-400" />
                      <span>Surface Wind:</span>
                    </span>
                    <span className="font-mono text-[var(--fg)]">
                      {snapshot.weather.windSpeed} km/h ({(snapshot.weather.windSpeed ?? 0) < 6 ? 'Calm' : 'Breezy'})
                    </span>
                  </div>
                </div>

                {/* Card CTA */}
                <button
                  onClick={onEnterDashboard}
                  className="w-full mt-5 py-3 rounded-xl bg-[var(--accent-subtle)] hover:bg-[var(--accent)] hover:text-white border border-[var(--accent-line)] text-[var(--accent)] text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs"
                >
                  <span>Open Full Air Quality &amp; Daily Planner</span>
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Everyday Pillars Section */}
      <PillarGrid />
    </div>
  );
};
