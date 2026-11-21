import { FactRegistry, GroundedAIResponse } from './types';
import { EnvironmentalSnapshot, AQIStandard } from '../../domain/types';
import { DailyHouseholdPlan } from '../../domain/planner/planner-types';
import { generateDeterministicBriefing, generateDeterministicAnswer } from './ai-fallback';
import { validateAIGrounding } from './grounding-validator';

/**
 * Checks if a Gemini API key or backend gateway is configured.
 */
export function isGeminiConfigured(): boolean {
  return typeof import.meta !== 'undefined' && !!((import.meta as any).env?.VITE_GEMINI_API_KEY);
}

/**
 * Generates an AI-grounded daily briefing.
 * Attempts server-side gateway first (/api/briefing) to ensure zero client-side key leakage.
 * Falls back to deterministic rule-based output if the gateway is offline,
 * if rate limits are exceeded, or if grounding validation rejects the response.
 */
export async function getGroundedDailyBriefing(
  snapshot: EnvironmentalSnapshot,
  plan: DailyHouseholdPlan,
  registry: FactRegistry,
  standard: AQIStandard = 'CPCB',
  customApiKey?: string
): Promise<GroundedAIResponse> {
  // 1. Try secure backend gateway first (server-side key custody)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch('/api/briefing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ snapshot, plan, registry, standard }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.headline && data.groundingStatus === 'VERIFIED') {
        return data;
      }
    }
  } catch {
    // Gateway offline, development mode, or static hosting — proceed to direct fallback
  }

  // 2. If client supplied a custom local key, execute direct with Fact-ID verification
  const envKey = typeof import.meta !== 'undefined' ? (import.meta as any).env?.VITE_GEMINI_API_KEY : undefined;
  const apiKey = customApiKey || envKey;

  if (!apiKey || apiKey.trim() === '') {
    return generateDeterministicBriefing(snapshot, plan, registry, standard);
  }

  try {
    const prompt = `
You are VayuSenseX AI, a scientific environmental assistant.
You MUST ONLY cite numbers from the provided verified Fact Registry. Never invent unverified numbers.

FACT REGISTRY:
${JSON.stringify(registry.facts, null, 2)}

HOUSEHOLD CONTEXT:
City: ${snapshot.location.city}
Cleanest Window: ${plan.cleanestAvailablePeriod}
Peak Smog: ${plan.peakPollutionPeriod}
Dose Reduction: ${plan.netDoseReductionPercent}%

Generate a JSON response conforming strictly to:
{
  "headline": string,
  "summary": string,
  "detailedExplanation": string,
  "actionableGuidance": string[],
  "supportingFactIds": string[],
  "numericalClaims": [{"factId": string, "statedValue": number, "unit": string}]
}
`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Gemini upstream returned status ${res.status}`);
    }

    const json = await res.json();
    const candidateText = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error('Empty Gemini response payload');
    }

    const parsed = JSON.parse(candidateText);

    // Validate Grounding against the Fact Registry
    const validation = validateAIGrounding(
      registry,
      parsed.supportingFactIds || [],
      parsed.numericalClaims || []
    );

    if (!validation.isValid) {
      console.warn('VayuSenseX Grounding Validator rejected AI response:', validation.errors);
      return generateDeterministicBriefing(snapshot, plan, registry, standard);
    }

    return {
      headline: parsed.headline || `${snapshot.location.city} Environmental Briefing`,
      summary: parsed.summary || '',
      detailedExplanation: parsed.detailedExplanation || '',
      actionableGuidance: Array.isArray(parsed.actionableGuidance) ? parsed.actionableGuidance : [],
      supportingFactIds: parsed.supportingFactIds || [],
      numericalClaims: parsed.numericalClaims || [],
      isDeterministicFallback: false,
      groundingStatus: 'VERIFIED',
      generatedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.warn('Gemini request failed; using deterministic fallback engine', err);
    return generateDeterministicBriefing(snapshot, plan, registry, standard);
  }
}

/**
 * Answers questions in "Ask VayuSenseX" with strict fact grounding.
 */
export async function askGroundedAssistant(
  question: string,
  snapshot: EnvironmentalSnapshot,
  plan: DailyHouseholdPlan,
  registry: FactRegistry,
  customApiKey?: string
): Promise<GroundedAIResponse> {
  // 1. Try secure backend gateway first
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch('/api/assist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, snapshot, plan, registry }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.headline && data.groundingStatus === 'VERIFIED') {
        return data;
      }
    }
  } catch {
    // Gateway offline or direct fallback
  }

  const envKey = typeof import.meta !== 'undefined' ? (import.meta as any).env?.VITE_GEMINI_API_KEY : undefined;
  const apiKey = customApiKey || envKey;

  if (!apiKey || apiKey.trim() === '') {
    return generateDeterministicAnswer(question, snapshot, plan, registry);
  }

  try {
    const prompt = `
You are VayuSenseX AI, answering a household question about air quality and daily routines.
You MUST ONLY cite numbers from the provided verified Fact Registry. Never invent unverified numbers.

USER QUESTION: "${question}"

FACT REGISTRY:
${JSON.stringify(registry.facts, null, 2)}

Generate a JSON response conforming strictly to:
{
  "headline": string,
  "summary": string,
  "detailedExplanation": string,
  "actionableGuidance": string[],
  "supportingFactIds": string[],
  "numericalClaims": [{"factId": string, "statedValue": number, "unit": string}]
}
`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Gemini upstream error ${res.status}`);
    }

    const json = await res.json();
    const candidateText = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) throw new Error('Empty Gemini response');

    const parsed = JSON.parse(candidateText);

    const validation = validateAIGrounding(
      registry,
      parsed.supportingFactIds || [],
      parsed.numericalClaims || []
    );

    if (!validation.isValid) {
      console.warn('Grounding Validator rejected answer; falling back', validation.errors);
      return generateDeterministicAnswer(question, snapshot, plan, registry);
    }

    return {
      headline: parsed.headline || 'Environmental Advisory',
      summary: parsed.summary || '',
      detailedExplanation: parsed.detailedExplanation || '',
      actionableGuidance: Array.isArray(parsed.actionableGuidance) ? parsed.actionableGuidance : [],
      supportingFactIds: parsed.supportingFactIds || [],
      numericalClaims: parsed.numericalClaims || [],
      isDeterministicFallback: false,
      groundingStatus: 'VERIFIED',
      generatedAt: new Date().toISOString(),
    };
  } catch {
    return generateDeterministicAnswer(question, snapshot, plan, registry);
  }
}
