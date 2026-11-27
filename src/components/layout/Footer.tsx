import React from 'react';
import { ShieldCheck, ExternalLink, Wind, Heart, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer
      className="bg-[var(--surface-3)] relative overflow-hidden border-t border-[var(--border-strong)] pt-12 pb-8 shadow-inner mt-auto text-[var(--fg-muted)] text-sm"
      role="contentinfo"
    >
      {/* Background radial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/2 -z-10 h-[500px] w-[900px] -translate-x-1/2 translate-y-1/2 rounded-full bg-[radial-gradient(circle,_var(--accent-subtle)_0%,_transparent_70%)] opacity-30 mix-blend-screen"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-8">
        {/* Friendly Clean Air Advisory Block */}
        <div className="bg-[var(--surface-2)] mb-12 flex flex-col items-start justify-between gap-6 rounded-2xl border border-[var(--border-faint)] px-6 py-6 shadow-[var(--shadow-sm)] lg:flex-row lg:items-center">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex size-6 items-center justify-center rounded-full border border-[var(--accent-line)] bg-[var(--accent-subtle)] text-[var(--accent)]">
                <Wind className="size-3.5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
                Your Daily Clean Air Companion
              </span>
            </div>
            <h3 className="text-[var(--fg)] text-xl font-bold sm:text-2xl">
              Clear air data. Simple everyday advice.
            </h3>
            <p className="text-[var(--fg-muted)] mt-1.5 text-xs sm:text-sm leading-relaxed">
              VayuSenseX turns live pollution and weather forecasts into practical steps to protect your children, parents, and home during hazy and smoggy days.
            </p>
          </div>

          {/* Live System Operational Status Badge */}
          <div className="bg-[var(--surface)] flex items-center gap-3 rounded-xl border border-[var(--border-strong)] px-4 py-3 shrink-0">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--positive)] opacity-75" />
              <span className="relative inline-flex size-2.5 rounded-full bg-[var(--positive)]" />
            </span>
            <div className="flex flex-col">
              <span className="text-[var(--fg)] text-[11px] font-bold tracking-widest uppercase">
                Live Data: Connected
              </span>
              <span className="text-[var(--fg-subtle)] text-[10px] font-mono">
                Air Quality &amp; Weather Feeds Active
              </span>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 mb-10">
          {/* Brand & Mission Column */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center space-x-2 text-[var(--fg)] font-bold text-base">
              <span className="text-[var(--accent)]">VayuSense</span>X
            </div>
            <p className="text-xs text-[var(--fg-muted)] leading-relaxed">
              Understand the air. Protect your world. Helping families stay safe and breathe easier during winter smog and city pollution.
            </p>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[var(--positive-subtle)] border border-[var(--positive-subtle)] text-[var(--positive)] text-[11px] font-semibold w-fit">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Accessible &amp; Easy to Read</span>
            </div>
          </div>

          {/* Everyday Features */}
          <div>
            <h4 className="text-xs font-bold text-[var(--fg)] uppercase tracking-wider mb-3">
              How We Help
            </h4>
            <ul className="space-y-2 text-xs text-[var(--fg-muted)]">
              <li className="hover:text-[var(--accent)] transition-colors">India &amp; US Air Quality Checks</li>
              <li className="hover:text-[var(--accent)] transition-colors">Trapped Smog &amp; Wind Alerts</li>
              <li className="hover:text-[var(--accent)] transition-colors">Daily Breathing Risk Guide</li>
              <li className="hover:text-[var(--accent)] transition-colors">Home Air Purifier Sizing</li>
              <li className="hover:text-[var(--accent)] transition-colors">Safer Commute Routes</li>
            </ul>
          </div>

          {/* Trusted Public Sources */}
          <div>
            <h4 className="text-xs font-bold text-[var(--fg)] uppercase tracking-wider mb-3">
              Trusted Sources
            </h4>
            <ul className="space-y-2 text-xs text-[var(--fg-muted)]">
              <li>
                <a
                  href="https://open-meteo.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center hover:text-[var(--accent)] transition-colors"
                >
                  <span>Open-Meteo Air &amp; Weather</span>
                  <ExternalLink className="w-3 h-3 ml-1 text-[var(--fg-subtle)]" />
                </a>
              </li>
              <li>
                <a
                  href="https://cpcb.nic.in"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center hover:text-[var(--accent)] transition-colors"
                >
                  <span>India CPCB Air Standards</span>
                  <ExternalLink className="w-3 h-3 ml-1 text-[var(--fg-subtle)]" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.epa.gov/air-quality"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center hover:text-[var(--accent)] transition-colors"
                >
                  <span>US EPA Air Quality Guide</span>
                  <ExternalLink className="w-3 h-3 ml-1 text-[var(--fg-subtle)]" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.who.int/health-topics/air-pollution"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center hover:text-[var(--accent)] transition-colors"
                >
                  <span>WHO Clean Air Guidelines</span>
                  <ExternalLink className="w-3 h-3 ml-1 text-[var(--fg-subtle)]" />
                </a>
              </li>
            </ul>
          </div>

          {/* Our Promise */}
          <div>
            <h4 className="text-xs font-bold text-[var(--fg)] uppercase tracking-wider mb-3">
              Our Promise
            </h4>
            <p className="text-xs text-[var(--fg-muted)] leading-relaxed mb-2">
              Trusted data handles the numbers. AI explains what they mean in plain words. You stay in control of your family&apos;s choices.
            </p>
            <p className="text-[11px] text-[var(--fg-subtle)]">
              Guidance here helps with daily planning and is not a substitute for personal medical advice from a doctor.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[var(--border)] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--fg-subtle)]">
          <div>
            &copy; 2026 VayuSenseX · Urban Air Quality Assistant for Families &amp; Communities.
          </div>
          <div className="flex items-center space-x-4 mt-3 sm:mt-0 font-medium">
            <span className="inline-flex items-center text-[var(--accent)] text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Fact-Checked Guidance
            </span>
            <span className="inline-flex items-center text-[var(--positive)] text-[11px]">
              <Heart className="w-3.5 h-3.5 mr-1" /> Private &amp; Stored on Your Device
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
