# VayuSenseX — Implementation Changelog (`IMPLEMENTATION_CHANGELOG.md`)

**Date:** 2026-11-26

| File | Change Summary |
| :--- | :--- |
| `AUDIT_HARDCODED_DATA.md` | Created complete forensic audit classifying hardcoded, disconnected, and scientific constants |
| `GENAI_INTEGRATION_REPORT.md` | Documented server-only Gemini custody, multi-turn pipeline, grounding, and health probes |
| `DATA_PROVENANCE_REPORT.md` | Documented Open-Meteo/CAMS providers, units, caching, and offline disclosure |
| `FUNCTIONAL_VERIFICATION_REPORT.md` | Documented lint, typecheck, 922-test suite, build, and deployment architecture |
| `.env.example` | Safe environment template (`GEMINI_API_KEY`, `GEMINI_MODEL=gemini-2.5-flash`, `PORT`, `ALLOWED_ORIGINS`) |
| `server.ts` | Added `loadLocalEnv()` for `.env.local`/`.env`, `/api/health?probe=true`, multi-turn cache bypass, and static `dist/` serving |
| `server/aiService.ts` | Upgraded to `gemini-2.5-flash`, added retry/timeout, `systemInstruction`, multi-turn history, token usage, and `checkGeminiHealth()` |
| `server/schemas.ts` | Added `ConversationTurnSchema` and `history` validation on `AssistRequestSchema` |
| `src/services/ai/types.ts` | Added `ConversationTurn` and response metadata (`model`, `fallbackReason`, `tokenUsage`) |
| `src/services/ai/gemini-client.ts` | Removed client-side direct Gemini `fetch`; added `fetchGatewayAIHealth()` and multi-turn `askGroundedAssistant()` |
| `src/features/assistant/AIAssistantWorkbench.tsx` | Removed `localStorage` API key input; added multi-turn conversation thread, copy/reset, and live Gemini health probe |
| `src/features/mobility/MobilityWorkbench.tsx` | Wired `currentOutdoorPm25` and `currentCity` from `App.tsx` via `useEffect` |
| `src/features/indoor/IndoorWorkbench.tsx` | Synced `outdoorConcentration` with `currentOutdoorPm25` on city changes |
| `src/features/community/CommunityHub.tsx` | Wired `currentCity` dynamically into `CommunityStore.getAggregatedStats()` |
| `src/features/dashboard/DashboardPage.tsx` | Added explicit `telemetryError` offline warning banner and `role="alert"` dispersion status |
| `src/app/App.tsx` | Propagated `telemetryError`, `currentOutdoorPm25`, and `currentCity` across workbenches; added `React.lazy` code splitting |
| `src/domain/impact/impact-ledger.ts` | Replaced `Math.random()` entry ID generation with `crypto.randomUUID()` |
