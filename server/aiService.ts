import { FactRegistry, GroundedAIResponse } from '../src/services/ai/types';
import { validateAIGrounding } from '../src/services/ai/grounding-validator';
import { generateDeterministicBriefing, generateDeterministicAnswer } from '../src/services/ai/ai-fallback';
import { EnvironmentalSnapshot, AQIStandard } from '../src/domain/types';
import { DailyHouseholdPlan } from '../src/domain/planner/planner-types';

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

/**
 * Server-side AI proxy service ensuring API keys remain strictly on the backend.
 */
export async function executeServerGroundedBriefing(
  snapshot: EnvironmentalSnapshot,
  plan: DailyHouseholdPlan,
  registry: FactRegistry,
  standard: AQIStandard = 'CPCB'
): Promise<GroundedAIResponse> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    return generateDeterministicBriefing(snapshot, plan, registry, standard);
  }

  try {
    const prompt = `
You are VayuSenseX AI, a scientific urban environmental assistant.
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
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
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
      throw new Error(`Upstream Gemini error HTTP ${res.status}`);
    }

    const json = await res.json();
    const candidateText = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) throw new Error('Empty Gemini response payload');

    const parsed = JSON.parse(candidateText);

    // Run strict Fact-ID verification
    const validation = validateAIGrounding(
      registry,
      parsed.supportingFactIds || [],
      parsed.numericalClaims || []
    );

    if (!validation.isValid) {
      console.warn('[Server AI Service]: Grounding Validator rejected response; serving fallback');
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
    console.warn('[Server AI Service]: Upstream failure, using deterministic fallback', (err as Error).message);
    return generateDeterministicBriefing(snapshot, plan, registry, standard);
  }
}

/**
 * Server-side AI assistant Q&A with Fact-ID verification.
 */
export async function executeServerGroundedAnswer(
  question: string,
  snapshot: EnvironmentalSnapshot,
  plan: DailyHouseholdPlan,
  registry: FactRegistry
): Promise<GroundedAIResponse> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    return generateDeterministicAnswer(question, snapshot, plan, registry);
  }

  try {
    const prompt = `
You are VayuSenseX AI, answering a household air quality question.
You MUST ONLY cite numbers from the provided verified Fact Registry. Never invent numbers.

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
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
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

    if (!res.ok) throw new Error(`Gemini upstream HTTP ${res.status}`);

    const json = await res.json();
    const candidateText = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) throw new Error('Empty response payload');

    const parsed = JSON.parse(candidateText);

    const validation = validateAIGrounding(
      registry,
      parsed.supportingFactIds || [],
      parsed.numericalClaims || []
    );

    if (!validation.isValid) {
      return generateDeterministicAnswer(question, snapshot, plan, registry);
    }

    return {
      headline: parsed.headline || 'Environmental Guidance',
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
