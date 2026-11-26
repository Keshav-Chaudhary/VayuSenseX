import React from 'react';
import { Copy, Check } from 'lucide-react';
import { GroundedAIResponse } from '../../services/ai/types';

export interface ChatExchangeItem {
  id: string;
  question: string;
  response: GroundedAIResponse;
}

interface ChatThreadListProps {
  chatHistory: ChatExchangeItem[];
  city: string;
  copiedId: string | null;
  onCopy: (id: string, resp: GroundedAIResponse) => void;
}

export const ChatThreadList: React.FC<ChatThreadListProps> = ({
  chatHistory,
  city,
  copiedId,
  onCopy,
}) => (
  <>
    {chatHistory.map((exchange) => (
      <div key={exchange.id} className="glass-panel p-6 sm:p-7 rounded-2xl border border-white/10 bg-midnight-900/60 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-[11px] text-slate-400">Question ({city}):</span>
            <h4 className="text-sm font-bold text-white mt-0.5">&quot;{exchange.question}&quot;</h4>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => onCopy(exchange.id, exchange.response)}
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
  </>
);
