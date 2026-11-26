import { ConversationTurn, FactRegistry, GroundedAIResponse } from '../src/services/ai/types';
import { generateDeterministicBriefing, generateDeterministicAnswer } from '../src/services/ai/ai-fallback';
import { EnvironmentalSnapshot, AQIStandard } from '../src/domain/types';
import { DailyHouseholdPlan } from '../src/domain/planner/planner-types';
import { fetchGeminiWithRetry, getGeminiModel, invokeGroundedGemini } from './gemini-http';

export { getGeminiModel };

export interface GeminiHealthStatus {
  apiKeyConfigured: boolean;
  model: string;
  status: 'READY' | 'MISSING_KEY' | 'CONNECTED' | 'UNREACHABLE' | 'ERROR';
  latencyMs?: number;
  errorCode?: string;
}

/**
 * Verifies Gemini API configuration and optionally performs a minimal live connectivity probe.
 */
export async function checkGeminiHealth(probe: boolean = false): Promise<GeminiHealthStatus> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const model = getGeminiModel();

  if (!apiKey) {
    return { apiKeyConfigured: false, model, status: 'MISSING_KEY' };
  }
  if (!probe) {
    return { apiKeyConfigured: true, model, status: 'READY' };
  }

  const start = Date.now();
  try {
    const res = await fetchGeminiWithRetry(
      apiKey,
      model,
      {
        contents: [{ role: 'user', parts: [{ text: 'Reply with OK' }] }],
        generationConfig: { maxOutputTokens: 8, temperature: 0 },
      },
      5000,
      0
    );
    const latencyMs = Date.now() - start;

    if (!res.ok) {
      return { apiKeyConfigured: true, model, status: 'ERROR', latencyMs, errorCode: `HTTP_${res.status}` };
    }
    return { apiKeyConfigured: true, model, status: 'CONNECTED', latencyMs };
  } catch {
    return { apiKeyConfigured: true, model, status: 'UNREACHABLE', latencyMs: Date.now() - start };
  }
}

/**
 * Server-side AI proxy service ensuring API keys remain strictly on the backend.
 */
export async function executeServerGroundedBriefing(
  snapshot: EnvironmentalSnapshot,
  plan: DailyHouseholdPlan,
  registry: FactRegistry,
  standard: AQIStandard = 'CPCB'
): Promise<GroundedAIResponse> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return { ...generateDeterministicBriefing(snapshot, plan, registry, standard), fallbackReason: 'MISSING_API_KEY' };
  }

  try {
    const prompt = `
Generate a grounded daily environmental briefing for ${snapshot.location.city} (${standard} standard).

FACT REGISTRY:
${JSON.stringify(registry.facts, null, 2)}

HOUSEHOLD CONTEXT:
Cleanest Window: ${plan.cleanestAvailablePeriod}
Peak Smog: ${plan.peakPollutionPeriod}
Estimated Dose Reduction: ${plan.netDoseReductionPercent}%

Return strict JSON:
{
  "headline": string,
  "summary": string,
  "detailedExplanation": string,
  "actionableGuidance": string[],
  "supportingFactIds": string[],
  "numericalClaims": [{"factId": string, "statedValue": number, "unit": string}]
}`;

    const { parsed, tokenUsage } = await invokeGroundedGemini(
      apiKey,
      [{ role: 'user', parts: [{ text: prompt }] }],
      registry
    );

    return {
      headline: (parsed.headline as string) || `${snapshot.location.city} Environmental Briefing`,
      summary: (parsed.summary as string) || '',
      detailedExplanation: (parsed.detailedExplanation as string) || '',
      actionableGuidance: Array.isArray(parsed.actionableGuidance) ? (parsed.actionableGuidance as string[]) : [],
      supportingFactIds: (parsed.supportingFactIds as string[]) || [],
      numericalClaims: (parsed.numericalClaims as GroundedAIResponse['numericalClaims']) || [],
      isDeterministicFallback: false,
      groundingStatus: 'VERIFIED',
      generatedAt: new Date().toISOString(),
      model: getGeminiModel(),
      tokenUsage,
    };
  } catch (err) {
    const msg = (err as Error).message || 'UNKNOWN';
    console.warn('[Server AI Service]: Briefing fallback triggered:', msg);
    return {
      ...generateDeterministicBriefing(snapshot, plan, registry, standard),
      fallbackReason: msg.startsWith('GROUNDING_REJECTED') ? 'GROUNDING_REJECTED' : 'UPSTREAM_UNAVAILABLE',
    };
  }
}

/**
 * Server-side multi-turn AI assistant Q&A with Fact-ID verification.
 */
export async function executeServerGroundedAnswer(
  question: string,
  snapshot: EnvironmentalSnapshot,
  plan: DailyHouseholdPlan,
  registry: FactRegistry,
  history: ConversationTurn[] = []
): Promise<GroundedAIResponse> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return { ...generateDeterministicAnswer(question, snapshot, plan, registry), fallbackReason: 'MISSING_API_KEY' };
  }

  try {
    const contextPrompt = `
Answer the user's urban air quality question using ONLY numbers from the provided verified Fact Registry.

FACT REGISTRY (${snapshot.location.city}):
${JSON.stringify(registry.facts, null, 2)}

USER QUESTION: "${question}"

Return strict JSON:
{
  "headline": string,
  "summary": string,
  "detailedExplanation": string,
  "actionableGuidance": string[],
  "supportingFactIds": string[],
  "numericalClaims": [{"factId": string, "statedValue": number, "unit": string}]
}`;

    const contents = [
      ...history.slice(-8).map((turn) => ({ role: turn.role, parts: [{ text: turn.text }] })),
      { role: 'user', parts: [{ text: contextPrompt }] },
    ];

    const { parsed, tokenUsage } = await invokeGroundedGemini(apiKey, contents, registry);

    return {
      headline: (parsed.headline as string) || 'Environmental Guidance',
      summary: (parsed.summary as string) || '',
      detailedExplanation: (parsed.detailedExplanation as string) || '',
      actionableGuidance: Array.isArray(parsed.actionableGuidance) ? (parsed.actionableGuidance as string[]) : [],
      supportingFactIds: (parsed.supportingFactIds as string[]) || [],
      numericalClaims: (parsed.numericalClaims as GroundedAIResponse['numericalClaims']) || [],
      isDeterministicFallback: false,
      groundingStatus: 'VERIFIED',
      generatedAt: new Date().toISOString(),
      model: getGeminiModel(),
      tokenUsage,
    };
  } catch (err) {
    const msg = (err as Error).message || 'UNKNOWN';
    console.warn('[Server AI Service]: Assistant fallback triggered:', msg);
    return {
      ...generateDeterministicAnswer(question, snapshot, plan, registry),
      fallbackReason: msg.startsWith('GROUNDING_REJECTED') ? 'GROUNDING_REJECTED' : 'UPSTREAM_UNAVAILABLE',
    };
  }
}
