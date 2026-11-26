import React, { useState, useMemo, useEffect } from 'react';
import { Bot, Send, RefreshCw, Trash2, HelpCircle } from 'lucide-react';
import { HouseholdProfile } from '../../domain/household/types';
import { EnvironmentalSnapshot } from '../../domain/types';
import { HourlyForecastPoint } from '../../services/environment/types';
import { generateDailyHouseholdPlan } from '../../domain/planner/schedule-optimizer';
import { buildFactRegistry } from '../../services/ai/fact-registry';
import { getGroundedDailyBriefing, askGroundedAssistant, fetchGatewayAIHealth, GatewayAIHealth } from '../../services/ai/gemini-client';
import { ConversationTurn, GroundedAIResponse } from '../../services/ai/types';
import { FactRegistryPanel } from './FactRegistryPanel';
import { BriefingCard } from './BriefingCard';
import { AssistantHeader } from './AssistantHeader';
import { ChatThreadList, ChatExchangeItem } from './ChatThreadList';
import { GroundingInspector } from './GroundingInspector';

interface AIAssistantWorkbenchProps {
  profile: HouseholdProfile;
  snapshot: EnvironmentalSnapshot;
  hourlyForecast: HourlyForecastPoint[];
}

type ChatExchange = ChatExchangeItem;

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
      <AssistantHeader
        gatewayHealth={gatewayHealth}
        geminiActive={Boolean(geminiActive)}
        isProbing={isProbing}
        onProbe={handleProbeGemini}
      />

      {/* Grounded Daily Briefing Card */}
      <BriefingCard
        profileName={profile.name}
        cityName={snapshot.location.city}
        briefing={briefing}
        isLoading={isLoadingBriefing}
      />

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
          <ChatThreadList
            chatHistory={chatHistory}
            city={snapshot.location.city}
            copiedId={copiedId}
            onCopy={handleCopy}
          />

          {/* Grounding Inspector for Latest Turn */}
          {latestExchange && (
            <GroundingInspector
              show={showGroundingInspector}
              onToggle={() => setShowGroundingInspector(!showGroundingInspector)}
              groundingStatus={latestExchange.response.groundingStatus}
              supportingFactIds={latestExchange.response.supportingFactIds}
              factRegistry={factRegistry}
            />
          )}
        </div>

        {/* Right 1 Col: Live Fact Registry Inspector */}
        <FactRegistryPanel factRegistry={factRegistry} />
      </div>
    </div>
  );
};
