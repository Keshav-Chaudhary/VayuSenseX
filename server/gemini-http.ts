import { GroundedAIResponse, FactRegistry } from '../src/services/ai/types';
import { validateAIGrounding } from '../src/services/ai/grounding-validator';

const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

export const GEMINI_SYSTEM_INSTRUCTION =
  'You are VayuSenseX AI, a scientific urban environmental decision-support assistant. ' +
  'The deterministic engine owns all numbers; you own clear explanations and household guidance. ' +
  'Cite ONLY numerical values present in the provided Fact Registry. Never invent measurements, ' +
  'never diagnose medical conditions, and explicitly note data limitations when relevant.';

export function getGeminiModel(): string {
  return (process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL).trim();
}

export interface GeminiPayloadResult {
  parsed: Record<string, unknown>;
  tokenUsage?: GroundedAIResponse['tokenUsage'];
}

/**
 * Executes a POST request to Google AI Studio Gemini using header-based key authentication.
 */
export async function fetchGeminiWithRetry(
  apiKey: string,
  model: string,
  body: Record<string, unknown>,
  timeoutMs: number = 8000,
  maxRetries: number = 1
): Promise<Response> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

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

export async function invokeGroundedGemini(
  apiKey: string,
  contents: Array<{ role: string; parts: Array<{ text: string }> }>,
  registry: FactRegistry
): Promise<GeminiPayloadResult> {
  const res = await fetchGeminiWithRetry(apiKey, getGeminiModel(), {
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
