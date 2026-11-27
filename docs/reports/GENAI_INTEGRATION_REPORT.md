# VayuSenseX — GenAI Integration Report (`GENAI_INTEGRATION_REPORT.md`)

**Date:** 2026-11-26  
**Architecture:** Express 5 Backend Gateway (`server.ts`, `server/aiService.ts`) + Fact-ID Grounding (`src/services/ai/`)  
**Default Model:** `gemini-2.5-flash` (configurable via `process.env.GEMINI_MODEL`)

---

## 1. Security & Key Custody Architecture

- **Strict Server-Only Key Custody:** `GEMINI_API_KEY` is read exclusively from `process.env.GEMINI_API_KEY` on the Express 5 server.
- **Zero Client Secret Exposure:** All browser `localStorage` API key storage and client-side direct Gemini `fetch` calls were removed from `src/features/assistant/AIAssistantWorkbench.tsx` and `src/services/ai/gemini-client.ts`.
- **Automatic Local Environment Loading:** `server.ts` executes `loadLocalEnv()` at startup to load `.env.local` and `.env` (both excluded via `.gitignore`).
- **Local Workspace Key Status (Honest Reporting):** `.env.local` is not currently present in the workspace (`GEMINI_API_KEY` unset). Consequently, `GET /api/health` accurately reports `gemini.status: "MISSING_KEY"`, and AI endpoints deterministically return grounded fallback responses tagged with `fallbackReason: "MISSING_API_KEY"` until a valid Google AI Studio key is configured in `.env.local` or Firebase App Hosting secrets.

---

## 2. Server-Side Pipeline & Reliability

1. **Request Validation (`server/schemas.ts`):** `BriefingRequestSchema` and `AssistRequestSchema` validate snapshot, plan, registry, prompt length (`1..500`), and multi-turn `history` (max 12 turns).
2. **System Instruction & Grounding (`server/aiService.ts`):** Enforces separation of concerns — Gemini explains verified facts from `registry.facts` and never invents measurements.
3. **Timeout & Retry:** `fetchGeminiWithRetry` uses an `8000ms` `AbortController` timeout and 1 automatic retry on HTTP `429` or `5xx` upstream errors.
4. **Anti-Hallucination Validation (`validateAIGrounding`):** Rejects responses citing unverified Fact-IDs or numbers outside tolerance and triggers deterministic fallback (`fallbackReason: "GROUNDING_REJECTED"`).
5. **Health Check (`GET /api/health`):**
   - Default (`GET /api/health`): Zero-cost check returning `{ apiKeyConfigured, model, status: "READY" | "MISSING_KEY" }`.
   - Active Probe (`GET /api/health?probe=true`): Executes a minimal 8-token Gemini probe returning `CONNECTED`, `UNREACHABLE`, or `ERROR` with latency in ms.
6. **Multi-Turn Assistant (`AIAssistantWorkbench.tsx`):** Supports conversation history (auto-cleared on city change), copy-to-clipboard, thread reset, and explicit engine/fallback badges.
