import React, { useState, useMemo, useEffect } from 'react';
import {
  Bot, ShieldCheck, Sparkles, Send, CheckCircle,
  HelpCircle, ChevronDown, ChevronUp, RefreshCw, Cpu, Copy, Trash2, Check
} from 'lucide-react';
import { HouseholdProfile } from '../../domain/household/types';
import { EnvironmentalSnapshot } from '../../domain/types';
import { HourlyForecastPoint } from '../../services/environment/types';
import { generateDailyHouseholdPlan } from '../../domain/planner/schedule-optimizer';
import { buildFactRegistry } from '../../services/ai/fact-registry';
import {
  getGroundedDailyBriefing,
  askGroundedAssistant,
  fetchGatewayAIHealth,
  GatewayAIHealth,
} from '../../services/ai/gemini-client';
import { ConversationTurn, GroundedAIResponse } from '../../services/ai/types';

interface AIAssistantWorkbenchProps {
  profile: HouseholdProfile;
  snapshot: EnvironmentalSnapshot;
  hourlyForecast: HourlyForecastPoint[];
}

interface ChatExchange {
  id: string;
  question: string;
  response: GroundedAIResponse;
}

const PRESET_QUESTIONS = [
  'Should our household open the windows for fresh air today?',
  'When is the safest time for outdoor exercise or school commute?',
  'Why is the CPCB NAQI score different from the US EPA AQI?',
  'How much can our air purifier CADR reduce indoor PM2.5 levels?',
];

export const AIAssistantWorkbench: React.FC<AIAssistantWorkbenchProps> = ({
  profile,
  snapshot,
  hourlyForecast,
}) => {
  const [gatewayHealth, setGatewayHealth] = useState<GatewayAIHealth | null>(null);
  const [isProbing, setIsProbing] = useState(false);

  // Multi-turn conversation state
  const [userQuery, setUserQuery] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<ChatExchange[]>([]);
  const [showGroundingInspector, setShowGroundingInspector] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Daily briefing state
  const [briefing, setBriefing] = useState<GroundedAIResponse | null>(null);
  const [isLoadingBriefing, setIsLoadingBriefing] = useState<boolean>(true);

  const plan = useMemo(() => {
    return generateDailyHouseholdPlan(profile, hourlyForecast, snapshot.pollutants.pm25 ?? 150);
  }, [profile, hourlyForecast, snapshot.pollutants.pm25]);

  const factRegistry = useMemo(() => {
    return buildFactRegistry(snapshot, plan);
  }, [snapshot, plan]);

  // Reset conversation when city changes so contexts never mix across locations
  useEffect(() => {
    setChatHistory([]);
  }, [snapshot.location.city]);

  // Check backend gateway AI readiness on mount (non-intrusive, zero token cost)
  useEffect(() => {
    let active = true;
    fetchGatewayAIHealth(false).then((h) => {
      if (active) setGatewayHealth(h);
    });
    return () => {
      active = false;
    };
  }, []);

  // Generate grounded daily briefing on context change
  useEffect(() => {
    let isMounted = true;
    setIsLoadingBriefing(true);

    getGroundedDailyBriefing(snapshot, plan, factRegistry, 'CPCB')
      .then((res) => {
        if (isMounted) setBriefing(res);
      })
      .catch((err) => {
        console.error('Failed to generate briefing:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingBriefing(false);
      });

    return () => {
      isMounted = false;
    };
  }, [snapshot, plan, factRegistry]);

  const handleProbeGemini = async () => {
    setIsProbing(true);
    const h = await fetchGatewayAIHealth(true);
    setGatewayHealth(h);
    setIsProbing(false);
  };

  const handleAskQuestion = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || isGenerating) return;
    setIsGenerating(true);
    setUserQuery('');

    const turns: ConversationTurn[] = chatHistory.flatMap((ex) => [
      { role: 'user' as const, text: ex.question },
      { role: 'model' as const, text: `${ex.response.headline}: ${ex.response.summary}` },
    ]);

    try {
      const resp = await askGroundedAssistant(trimmed, snapshot, plan, factRegistry, turns);
      setChatHistory((prev) => [
        ...prev,
        { id: `turn-${Date.now()}`, question: trimmed, response: resp },
      ]);
    } catch (err) {
      console.error('Ask assistant error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (id: string, resp: GroundedAIResponse) => {
    const text = `${resp.headline}\n\n${resp.summary}\n\n${resp.detailedExplanation}\n\nGuidance:\n- ${resp.actionableGuidance.join('\n- ')}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const latestExchange = chatHistory.length > 0 ? chatHistory[chatHistory.length - 1] : null;
  const geminiActive = gatewayHealth?.apiKeyConfigured && (gatewayHealth.status === 'READY' || gatewayHealth.status === 'CONNECTED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 relative overflow-hidden bg-gradient-to-r from-midnight-900 via-midnight-950 to-midnight-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Fact-Checked Clean Air Assistant</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Ask VayuSenseX
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Ask questions in plain language about today&apos;s air, opening windows, kids&apos; outdoor play, or air purifiers. Every number is checked against today&apos;s real readings.
            </p>
          </div>

          {/* Server Gateway & Gemini Status Pill */}
          <div className="flex items-center space-x-3 bg-midnight-900/80 p-3 rounded-xl border border-white/10 shrink-0">
            <div className={`p-2 rounded-lg ${geminiActive ? 'bg-cyan-500/20 text-cyan-400' : 'bg-teal-500/20 text-teal-400'}`}>
              {geminiActive ? <Bot className="w-5 h-5" /> : <Cpu className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400">Backend Engine:</span>
                <span className="text-xs font-mono font-bold text-white">
                  {geminiActive
                    ? `${gatewayHealth?.model || 'gemini-2.5-flash'} (${gatewayHealth?.status})`
                    : `Deterministic Fallback (${gatewayHealth?.status || 'CHECKING'})`}
                </span>
              </div>
              <button
                onClick={handleProbeGemini}
                disabled={isProbing}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 mt-0.5"
              >
                <RefreshCw className={`w-3 h-3 ${isProbing ? 'animate-spin' : ''}`} />
                <span>{isProbing ? 'Probing Gemini...' : 'Verify Live Gemini Connectivity'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grounded Daily Briefing Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 bg-midnight-900/60 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Today&apos;s Air Quality Summary</h2>
              <span className="text-[11px] text-slate-400">
                Prepared for {profile.name} • {snapshot.location.city}
              </span>
            </div>
          </div>

          {briefing && (
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-semibold">
                <CheckCircle className="w-3 h-3 text-teal-400" />
                <span>{briefing.groundingStatus}</span>
              </span>
              <span className="text-xs font-mono text-cyan-400 ml-1">
                {briefing.isDeterministicFallback
                  ? `Deterministic Fallback (${briefing.fallbackReason || 'OFFLINE'})`
                  : `Gemini (${briefing.model || 'Live'})`}
              </span>
            </div>
          )}
        </div>

        {isLoadingBriefing ? (
          <div className="p-8 text-center text-slate-400 text-xs flex items-center justify-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
            <span>Compiling verified environmental telemetry...</span>
          </div>
        ) : briefing ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-midnight-950/80 border border-white/5 space-y-2">
              <h3 className="text-base font-bold text-cyan-300">{briefing.headline}</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">{briefing.summary}</p>
              <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line pt-2 border-t border-white/5">
                {briefing.detailedExplanation}
              </p>
            </div>

            {briefing.actionableGuidance.length > 0 && (
              <div className="p-3.5 rounded-xl bg-midnight-950/60 border border-white/5 space-y-1.5">
                <span className="text-[11px] text-teal-300 font-bold block">Priority Actionable Guidance:</span>
                <ul className="list-disc pl-4 text-xs text-slate-300 space-y-1">
                  {briefing.actionableGuidance.map((action, i) => (
                    <li key={i}>{action}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-slate-500 font-medium">Verified Citing Fact-IDs:</span>
              {briefing.supportingFactIds.map((factId: string) => (
                <span
                  key={factId}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-midnight-800 text-cyan-300 border border-white/10"
                >
                  #{factId}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Multi-Turn Interactive Q&A Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-midnight-900/60 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Bot className="w-5 h-5 text-cyan-400" />
                <span>Ask Anything About Today&apos;s Air</span>
              </h3>
              {chatHistory.length > 0 && (
                <button
                  onClick={() => setChatHistory([])}
                  className="text-xs text-slate-400 hover:text-rose-300 inline-flex items-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Reset Thread</span>
                </button>
              )}
            </div>

            {/* Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-400 font-semibold block">Curated High-Impact Queries:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESET_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAskQuestion(q)}
                    className="p-2.5 rounded-xl bg-midnight-950/80 hover:bg-midnight-800 border border-white/5 hover:border-cyan-500/30 text-left text-xs text-slate-300 hover:text-white transition-all flex items-start space-x-2 group"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <span>{q}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Input Bar */}
            <div className="pt-2 flex items-center space-x-2">
              <input
                type="text"
                placeholder="Ask any follow-up question about ventilation, masks, exercise, or smog..."
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion(userQuery)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-midnight-950 border border-white/15 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
              <button
                onClick={() => handleAskQuestion(userQuery)}
                disabled={isGenerating || !userQuery.trim()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-midnight-950 font-bold text-xs hover:brightness-110 transition-all disabled:opacity-50 flex items-center space-x-1.5 shrink-0"
              >
                {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Ask</span>
              </button>
            </div>
          </div>

          {/* Conversation Thread */}
          {chatHistory.map((exchange) => (
            <div key={exchange.id} className="glass-panel p-6 sm:p-7 rounded-2xl border border-white/10 bg-midnight-900/60 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] text-slate-400">Question ({snapshot.location.city}):</span>
                  <h4 className="text-sm font-bold text-white mt-0.5">"{exchange.question}"</h4>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleCopy(exchange.id, exchange.response)}
                    className="px-2 py-1 rounded bg-midnight-800 hover:bg-midnight-700 text-[10px] text-slate-300 inline-flex items-center space-x-1"
                    title="Copy response"
                  >
                    {copiedId === exchange.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === exchange.id ? 'Copied' : 'Copy'}</span>
                  </button>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    exchange.response.isDeterministicFallback
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  }`}>
                    {exchange.response.isDeterministicFallback
                      ? `Rule-Based (${exchange.response.fallbackReason || 'Fallback'})`
                      : `Gemini (${exchange.response.model || 'Grounded'})`}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-midnight-950/80 border border-white/5 space-y-3">
                <h5 className="font-bold text-white text-sm">{exchange.response.headline}</h5>
                <p className="text-xs text-cyan-300 font-medium">{exchange.response.summary}</p>
                <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line pt-2 border-t border-white/5">
                  {exchange.response.detailedExplanation}
                </p>

                {exchange.response.actionableGuidance.length > 0 && (
                  <div className="pt-2 border-t border-white/5 space-y-1.5">
                    <span className="text-[11px] text-cyan-300 font-bold block">Recommended Action Steps:</span>
                    <ul className="list-disc pl-4 text-xs text-slate-300 space-y-1">
                      {exchange.response.actionableGuidance.map((action: string, i: number) => (
                        <li key={i}>{action}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Grounding Inspector for Latest Turn */}
          {latestExchange && (
            <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-midnight-900/60">
              <button
                onClick={() => setShowGroundingInspector(!showGroundingInspector)}
                className="inline-flex items-center space-x-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>{showGroundingInspector ? 'Hide Verification Inspector' : 'Inspect Mathematical Grounding'}</span>
                {showGroundingInspector ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showGroundingInspector && (
                <div className="mt-3 p-4 rounded-xl bg-midnight-950 border border-white/10 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">Ground-Truth Fact Verification Table</span>
                    <span className="font-mono text-[10px] text-slate-400">
                      Status: <strong className="text-teal-400">{latestExchange.response.groundingStatus}</strong>
                    </span>
                  </div>
                  <div className="space-y-2">
                    {latestExchange.response.supportingFactIds.map((fid: string) => {
                      const fact = factRegistry.facts[fid];
                      if (!fact) return null;
                      return (
                        <div key={fid} className="p-2.5 rounded-lg bg-midnight-900 border border-white/5 flex items-center justify-between">
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="font-mono text-cyan-400 font-bold text-[11px]">#{fid}</span>
                              <span className="text-[11px] text-slate-300">{fact.description}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono">
                              Provenance: {fact.provenance} • Unit: {fact.unit}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-white text-xs">{fact.value} {fact.unit}</span>
                            <div className="text-[10px] text-teal-400 font-semibold">✓ Verified</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right 1 Col: Live Fact Registry Inspector */}
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Today&apos;s Verified Numbers</span>
            </h3>
            <p className="text-xs text-slate-400">Real readings used to answer your questions</p>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-midnight-900/60 max-h-[500px] overflow-y-auto space-y-2 text-xs scrollbar-thin">
            {Object.values(factRegistry.facts).map((fact) => (
              <div key={fact.factId} className="p-2.5 rounded-xl bg-midnight-950/80 border border-white/5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-cyan-400 font-bold">#{fact.factId}</span>
                  <span className="font-mono text-xs font-bold text-white">{fact.value} {fact.unit}</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">{fact.description}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                  <span>Source: {fact.source}</span>
                  <span className="font-mono">{fact.provenance}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
