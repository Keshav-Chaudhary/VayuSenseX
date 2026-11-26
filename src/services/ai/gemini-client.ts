import { ConversationTurn, FactRegistry, GroundedAIResponse } from './types';
import { EnvironmentalSnapshot, AQIStandard } from '../../domain/types';
import { DailyHouseholdPlan } from '../../domain/planner/planner-types';
import { generateDeterministicBriefing, generateDeterministicAnswer } from './ai-fallback';

export interface GatewayAIHealth {
  backendReachable: boolean;
  apiKeyConfigured: boolean;
  model?: string;
  status: 'READY' | 'MISSING_KEY' | 'CONNECTED' | 'UNREACHABLE' | 'ERROR' | 'GATEWAY_OFFLINE';
}

/**
 * Queries the backend Express 5 security gateway for Gemini readiness without exposing secrets.
 */
export async function fetchGatewayAIHealth(probe: boolean = false): Promise<GatewayAIHealth> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`/api/health${probe ? '?probe=true' : ''}`, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return { backendReachable: true, apiKeyConfigured: false, status: 'ERROR' };
    }
    const json = await res.json();
    const g = json?.gemini;
    return {
      backendReachable: true,
      apiKeyConfigured: Boolean(g?.apiKeyConfigured),
      model: g?.model,
      status: g?.status || 'MISSING_KEY',
    };
  } catch {
    return { backendReachable: false, apiKeyConfigured: false, status: 'GATEWAY_OFFLINE' };
  }
}

/**
 * Generates an AI-grounded daily briefing strictly via the server-side security gateway (/api/briefing).
 * Falls back to deterministic rule-based output if the gateway is offline.
 */
export async function getGroundedDailyBriefing(
  snapshot: EnvironmentalSnapshot,
  plan: DailyHouseholdPlan,
  registry: FactRegistry,
  standard: AQIStandard = 'CPCB'
): Promise<GroundedAIResponse> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    const res = await fetch('/api/briefing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ snapshot, plan, registry, standard }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.headline) {
        return data as GroundedAIResponse;
      }
    }
  } catch {
    // Gateway offline or static hosting — fall through to deterministic engine
  }

  const fallback = generateDeterministicBriefing(snapshot, plan, registry, standard);
  return { ...fallback, fallbackReason: 'GATEWAY_OFFLINE' };
}

/**
 * Answers a user question with multi-turn context strictly via the server-side gateway (/api/assist).
 */
export async function askGroundedAssistant(
  question: string,
  snapshot: EnvironmentalSnapshot,
  plan: DailyHouseholdPlan,
  registry: FactRegistry,
  history: ConversationTurn[] = []
): Promise<GroundedAIResponse> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    const res = await fetch('/api/assist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, snapshot, plan, registry, history }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.headline) {
        return data as GroundedAIResponse;
      }
    }
  } catch {
    // Gateway offline — fall through to deterministic engine
  }

  const fallback = generateDeterministicAnswer(question, snapshot, plan, registry);
  return { ...fallback, fallbackReason: 'GATEWAY_OFFLINE' };
}
