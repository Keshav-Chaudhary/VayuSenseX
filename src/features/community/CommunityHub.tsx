import React, { useState } from 'react';
import { 
  Users, ShieldCheck, CheckCircle2, HeartHandshake, 
  Wind, Download, Check, Sparkles 
} from 'lucide-react';
import { CommunityStore } from '../../domain/community/community-store';
import { CommunityActionPledge } from '../../domain/community/types';
import { downloadJsonFile } from '../../lib/downloadJson';

function exportCommunityPledges(): void {
  downloadJsonFile(
    `vayusensex_community_pledges_${new Date().toISOString().slice(0, 10)}.json`,
    CommunityStore.exportPledgesJSON()
  );
}

interface CommunityHubProps {
  currentCity?: string;
}

export const CommunityHub: React.FC<CommunityHubProps> = ({ currentCity = 'Local Neighborhood' }) => {
  const [pledges, setPledges] = useState<CommunityActionPledge[]>(() => CommunityStore.getPledges());
  const [notification, setNotification] = useState<string | null>(null);
  const stats = CommunityStore.getAggregatedStats(`${currentCity} Local Collective`);

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleTogglePledge = (id: string) => {
    const updated = CommunityStore.togglePledge(id);
    setPledges([...updated]);
    notify('Pledge status updated');
  };

  const handleIncrementCompletion = (id: string) => {
    const updated = CommunityStore.incrementCompletion(id);
    setPledges([...updated]);
    notify('Day logged! Collective neighborhood savings updated');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 relative overflow-hidden bg-gradient-to-r from-midnight-900 via-midnight-950 to-midnight-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-3">
              <Users className="w-3.5 h-3.5" />
              <span>Modeled Neighborhood Archetype (Local-First Privacy — Zero Remote PII)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Neighborhood Clean Air Collective
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-3xl">
              Modeled collective citizen actions to suppress urban dust, eliminate biomass combustion, and shield vulnerable neighbors during severe winter smog episodes. All calculations execute locally with zero cloud surveillance.
            </p>
          </div>

          <button
            onClick={exportCommunityPledges}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-midnight-800 hover:bg-midnight-700 border border-white/10 text-xs font-medium text-slate-200 transition-colors shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Community Pledges</span>
          </button>
        </div>

        {/* Collective Impact Ticker */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="p-4 rounded-xl bg-midnight-900/60 border border-white/5">
            <span className="text-xs text-slate-400 block">Active Community Pledges</span>
            <div className="flex items-center space-x-2 mt-1">
              <HeartHandshake className="w-4 h-4 text-cyan-400" />
              <span className="text-xl font-bold text-white font-mono">
                {stats.totalActivePledges} Pledges Active
              </span>
            </div>
            <span className="text-[11px] text-slate-500">{stats.neighborhoodZone}</span>
          </div>

          <div className="p-4 rounded-xl bg-midnight-900/60 border border-white/5">
            <span className="text-xs text-slate-400 block">Collective Avoided PM2.5 Dust</span>
            <div className="flex items-center space-x-2 mt-1">
              <Wind className="w-4 h-4 text-teal-400" />
              <span className="text-xl font-bold text-teal-300 font-mono">
                {stats.collectiveAvoidedPM25Grams} g
              </span>
            </div>
            <span className="text-[11px] text-teal-400 font-medium">Particulate prevented at breathing height</span>
          </div>

          <div className="p-4 rounded-xl bg-midnight-900/60 border border-white/5">
            <span className="text-xs text-slate-400 block">Collective Avoided Carbon</span>
            <div className="flex items-center space-x-2 mt-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xl font-bold text-emerald-300 font-mono">
                {stats.collectiveAvoidedCO2eKg} kg
              </span>
              <span className="text-xs text-slate-400">CO2e</span>
            </div>
            <span className="text-[11px] text-emerald-400 font-medium">India National Grid factor verified</span>
          </div>
        </div>

        {notification && (
          <div role="status" aria-live="polite" className="mt-4 p-2.5 rounded-lg bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs flex items-center space-x-2 animate-fade-in">
            <Check className="w-4 h-4 text-teal-400 shrink-0" />
            <span>{notification}</span>
          </div>
        )}
      </div>

      {/* Privacy Guarantee Banner */}
      <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs flex items-start space-x-3 text-slate-300">
        <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-white">Privacy-Preserving Community Protocol:</strong> All pledges are stored locally in your browser. Aggregate figures are computed locally using transparent mathematical formulas. No personal identity, household address, or individual compliance history is broadcast to remote cloud databases.
        </p>
      </div>

      {/* Main Grid: Pledge Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <span>Neighborhood Action Pledges</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pledges.map(pledge => (
            <div
              key={pledge.id}
              className={`glass-card p-5 rounded-2xl border transition-all ${
                pledge.isPledged
                  ? 'border-cyan-500/40 bg-midnight-900/80 shadow-glow-cyan/5'
                  : 'border-white/10 bg-midnight-900/40 opacity-70'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-midnight-950 text-slate-300 border border-white/10">
                      {pledge.category.replace(/_/g, ' ')}
                    </span>
                    {pledge.isPledged && (
                      <span className="text-[10px] font-bold text-teal-400 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Active ({pledge.completedDaysCount} days done)</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white">{pledge.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{pledge.description}</p>
                </div>

                <button
                  onClick={() => handleTogglePledge(pledge.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    pledge.isPledged
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30'
                      : 'bg-cyan-500 text-midnight-950 hover:brightness-110 shadow-glow-cyan'
                  }`}
                >
                  {pledge.isPledged ? 'Withdraw' : 'Pledge'}
                </button>
              </div>

              {/* Rationale & Metrics */}
              <div className="mt-4 pt-3 border-t border-white/5 space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-midnight-950/60 text-slate-400 text-[11px] leading-relaxed">
                  <strong className="text-slate-300">Atmospheric Science:</strong> {pledge.scientificRationale}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="space-x-2">
                    <span className="font-mono text-teal-400 font-bold">
                      +{pledge.estimatedDailySavingsUgPerCapita} µg/day PM2.5
                    </span>
                    {pledge.estimatedDailyCO2eGramsPerCapita > 0 && (
                      <span className="font-mono text-emerald-400 font-bold">
                        • +{pledge.estimatedDailyCO2eGramsPerCapita}g CO2e/day
                      </span>
                    )}
                  </div>

                  {pledge.isPledged && (
                    <button
                      onClick={() => handleIncrementCompletion(pledge.id)}
                      className="px-2.5 py-1 rounded-lg bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 border border-teal-500/40 text-[11px] font-semibold"
                    >
                      + Log Today
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
