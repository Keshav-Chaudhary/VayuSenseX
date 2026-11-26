import React from 'react';
import { Home, Activity, Sliders, Gauge } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

export const PillarGrid: React.FC = React.memo(() => {
  return (
    <section id="features-section" className="py-20 border-t border-[var(--border)] bg-[var(--bg-subtle)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="mb-3 text-xs font-black tracking-[0.2em] text-[var(--accent)] uppercase">
            Practical Everyday Tools
          </div>
          <h2 className="text-[var(--fg)] text-3xl font-black tracking-tight sm:text-5xl">
            Built for Real Families, Not Just Scientists
          </h2>
          <p className="text-[var(--fg-muted)] mt-4 text-base leading-relaxed sm:text-lg">
            Get clear answers you can actually use—from planning morning school runs to keeping your bedroom air safe without guessing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group bg-[var(--surface-2)] relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[var(--border-faint)] p-7 shadow-[var(--shadow-sm)] transition-all hover:border-[var(--accent-line)] hover:shadow-[var(--shadow-md)]">
            <div>
              <span className="bg-[var(--surface-3)] text-[var(--accent)] relative mb-5 flex size-12 items-center justify-center rounded-2xl border border-[var(--border)] shadow-inner">
                <Gauge className="size-6" />
              </span>
              <div className="text-[var(--accent)] mb-2 text-xs font-bold tracking-wider uppercase">Step 01</div>
              <h3 className="text-[var(--fg)] text-xl font-bold">Live Air &amp; Smog Alerts</h3>
              <p className="text-[var(--fg-muted)] mt-3 text-sm leading-relaxed">
                Check today&apos;s air quality in India or US scales and get early warnings when calm winds trap smoke near the ground.
              </p>
            </div>
            <div className="text-[var(--fg-subtle)] mt-6 flex items-center justify-between border-t border-[var(--border-strong)]/60 pt-4 text-xs font-semibold">
              <span>Live Tracking</span>
              <Badge tone="accent">CPCB &amp; EPA</Badge>
            </div>
          </div>

          <div className="group bg-[var(--surface-2)] relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[var(--border-faint)] p-7 shadow-[var(--shadow-sm)] transition-all hover:border-[var(--accent-line)] hover:shadow-[var(--shadow-md)]">
            <div>
              <span className="bg-[var(--surface-3)] text-teal-400 relative mb-5 flex size-12 items-center justify-center rounded-2xl border border-[var(--border)] shadow-inner">
                <Activity className="size-6" />
              </span>
              <div className="text-teal-400 mb-2 text-xs font-bold tracking-wider uppercase">Step 02</div>
              <h3 className="text-[var(--fg)] text-xl font-bold">Best Hours to Go Out</h3>
              <p className="text-[var(--fg-muted)] mt-3 text-sm leading-relaxed">
                Plan walks, errands, and school commutes during the cleanest hours of the day—tailored for kids, seniors, and asthma care.
              </p>
            </div>
            <div className="text-[var(--fg-subtle)] mt-6 flex items-center justify-between border-t border-[var(--border-strong)]/60 pt-4 text-xs font-semibold">
              <span>Daily Routine</span>
              <Badge tone="positive">Family Safe</Badge>
            </div>
          </div>

          <div className="group bg-[var(--surface-2)] relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[var(--border-faint)] p-7 shadow-[var(--shadow-sm)] transition-all hover:border-[var(--accent-line)] hover:shadow-[var(--shadow-md)]">
            <div>
              <span className="bg-[var(--surface-3)] text-emerald-400 relative mb-5 flex size-12 items-center justify-center rounded-2xl border border-[var(--border)] shadow-inner">
                <Home className="size-6" />
              </span>
              <div className="text-emerald-400 mb-2 text-xs font-bold tracking-wider uppercase">Step 03</div>
              <h3 className="text-[var(--fg)] text-xl font-bold">Cleaner Indoor Air</h3>
              <p className="text-[var(--fg-muted)] mt-3 text-sm leading-relaxed">
                Find out what size air purifier your room needs, how to make an affordable DIY box-fan filter, and when to open windows.
              </p>
            </div>
            <div className="text-[var(--fg-subtle)] mt-6 flex items-center justify-between border-t border-[var(--border-strong)]/60 pt-4 text-xs font-semibold">
              <span>Home Air</span>
              <Badge tone="positive">Room Sizing</Badge>
            </div>
          </div>

          <div className="group bg-[var(--surface-2)] relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[var(--border-faint)] p-7 shadow-[var(--shadow-sm)] transition-all hover:border-[var(--accent-line)] hover:shadow-[var(--shadow-md)]">
            <div>
              <span className="bg-[var(--surface-3)] text-amber-400 relative mb-5 flex size-12 items-center justify-center rounded-2xl border border-[var(--border)] shadow-inner">
                <Sliders className="size-6" />
              </span>
              <div className="text-amber-400 mb-2 text-xs font-bold tracking-wider uppercase">Step 04</div>
              <h3 className="text-[var(--fg)] text-xl font-bold">Compare Choices</h3>
              <p className="text-[var(--fg-muted)] mt-3 text-sm leading-relaxed">
                Test simple swaps—like taking the metro instead of driving or running a filter overnight—and see how much pollution you avoid.
              </p>
            </div>
            <div className="text-[var(--fg-subtle)] mt-6 flex items-center justify-between border-t border-[var(--border-strong)]/60 pt-4 text-xs font-semibold">
              <span>What-If Tool</span>
              <Badge tone="caution">Real Savings</Badge>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});
