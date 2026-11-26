import React from 'react';
import { Bot, ShieldCheck, RefreshCw, Cpu } from 'lucide-react';
import { GatewayAIHealth } from '../../services/ai/gemini-client';

interface AssistantHeaderProps {
  gatewayHealth: GatewayAIHealth | null;
  geminiActive: boolean;
  isProbing: boolean;
  onProbe: () => void;
}

export const AssistantHeader: React.FC<AssistantHeaderProps> = ({
  gatewayHealth,
  geminiActive,
  isProbing,
  onProbe,
}) => (
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
            onClick={onProbe}
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
);
