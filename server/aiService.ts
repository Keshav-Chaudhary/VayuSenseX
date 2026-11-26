import { ConversationTurn, FactRegistry, GroundedAIResponse } from '../src/services/ai/types';
import { validateAIGrounding } from '../src/services/ai/grounding-validator';
import { generateDeterministicBriefing, generateDeterministicAnswer } from '../src/services/ai/ai-fallback';
import { EnvironmentalSnapshot, AQIStandard } from '../src/domain/types';
import { DailyHouseholdPlan } from '../src/domain/planner/planner-types';

const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_SYSTEM_INSTRUCTION =
  'You are VayuSenseX AI, a scientific urban environmental decision-support assistant. ' +
  'The deterministic engine owns all numbers; you own clear explanations and household guidance. ' +
  'Cite ONLY numerical values present in the provided Fact Registry. Never invent measurements, ' +
  'never diagnose medical conditions, and explicitly note data limitations when relevant.';

export function getGeminiModel(): string {
  return (process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL).trim();
}

export interface GeminiHealthStatus {
  apiKeyConfigured: boolean;
  model: string;
  status: 'READY' | 'MISSING_KEY' | 'CONNECTED' | 'UNREACHABLE' | 'ERROR';
  latencyMs?: number;
  errorCode?: string;
}

interface GeminiPayloadResult {
  parsed: Record<string, unknown>;
  tokenUsage?: GroundedAIResponse['tokenUsage'];
}

async function fetchGeminiWithRetry(
  url: string,
  body: Record<string, unknown>,
  timeoutMs: number = 8000,
  maxRetries: number = 1
): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      // Retry only on transient rate-limit or 5xx upstream errors
      if ((res.status === 429 || res.status >= 500) && attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 350 * (attempt + 1)));
        continue;
      }
      return res;
    } catch (err) {
      clearTimeout(timeoutId);
      lastError = err;
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 350 * (attempt + 1)));
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Gemini request failed');
}

async function invokeGroundedGemini(
  apiKey: string,
  contents: Array<{ role: string; parts: Array<{ text: string }> }>,
  registry: FactRegistry
): Promise<GeminiPayloadResult> {
  const model = getGeminiModel();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const res = await fetchGeminiWithRetry(url, {
    systemInstruction: { parts: [{ text: GEMINI_SYSTEM_INSTRUCTION }] },
    contents,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.2,
    },
  });

  if (!res.ok) {
    throw new Error(`Upstream Gemini error HTTP ${res.status}`);
  }

  const json = await res.json();
  const candidateText = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!candidateText) {
    throw new Error('Empty Gemini response payload');
  }

  const parsed = JSON.parse(candidateText) as Record<string, unknown>;
  const validation = validateAIGrounding(
    registry,
    Array.isArray(parsed.supportingFactIds) ? (parsed.supportingFactIds as string[]) : [],
    Array.isArray(parsed.numericalClaims) ? (parsed.numericalClaims as GroundedAIResponse['numericalClaims']) : []
  );

  if (!validation.isValid) {
    throw new Error(`GROUNDING_REJECTED: ${validation.errors.join('; ')}`);
  }

  const usage = json.usageMetadata;
  const tokenUsage = usage
    ? {
        promptTokens: usage.promptTokenCount,
        outputTokens: usage.candidatesTokenCount,
        totalTokens: usage.totalTokenCount,
      }
    : undefined;

  return { parsed, tokenUsage };
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
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const res = await fetchGeminiWithRetry(
      url,
      {
        contents: [{ role: 'user', parts: [{ text: 'Reply with OK' }] }],
        generationConfig: { maxOutputTokens: 8, temperature: 0 },
      },
      5000,
      0
    );
    const latencyMs = Date.now() - start;

    if (!res.ok) {
      return {
        apiKeyConfigured: true,
        model,
        status: 'ERROR',
        latencyMs,
        errorCode: `HTTP_${res.status}`,
      };
    }

    return { apiKeyConfigured: true, model, status: 'CONNECTED', latencyMs };
  } catch {
    return {
      apiKeyConfigured: true,
      model,
      status: 'UNREACHABLE',
      latencyMs: Date.now() - start,
    };
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
    const fallback = generateDeterministicBriefing(snapshot, plan, registry, standard);
    return { ...fallback, fallbackReason: 'MISSING_API_KEY' };
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
    const fallback = generateDeterministicBriefing(snapshot, plan, registry, standard);
    return {
      ...fallback,
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
    const fallback = generateDeterministicAnswer(question, snapshot, plan, registry);
    return { ...fallback, fallbackReason: 'MISSING_API_KEY' };
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
      ...history.slice(-8).map((turn) => ({
        role: turn.role,
        parts: [{ text: turn.text }],
      })),
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
    const fallback = generateDeterministicAnswer(question, snapshot, plan, registry);
    return {
      ...fallback,
      fallbackReason: msg.startsWith('GROUNDING_REJECTED') ? 'GROUNDING_REJECTED' : 'UPSTREAM_UNAVAILABLE',
    };
  }
}
