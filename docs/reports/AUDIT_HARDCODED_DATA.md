# VayuSenseX — Forensic Hardcoded Data & Integration Audit (`AUDIT_HARDCODED_DATA.md`)

**Audit Date:** 2026-11-26  
**Scope:** Full recursive inspection of `src/`, `server/`, `server.ts`, `tests/`, `.env*`, `firebase.json`, `apphosting.yaml`, and `package.json`.

---

## 1. Executive Summary

This forensic audit classifies every hardcoded value, fallback dataset, disconnected state, and mock/demo artifact in VayuSenseX into its engineering category so that **fake/disconnected production data is eliminated** while **legitimate scientific constants and deterministic physics engines are preserved**.

| Classification | Count | Action Policy |
| :--- | :---: | :--- |
| **Critical / High Disconnected or Mock Data** | 7 | Fix / wire to live state or server-side Gemini |
| **Static / Stale Application Data** | 4 | Synchronize dynamically with active city & telemetry |
| **API Fallback (Offline / Degraded Mode)** | 2 | Preserve with explicit `OFFLINE` / `STALE` / `ILLUSTRATIVE` UI disclosure |
| **Legitimate Scientific Constants** | 6+ | **Preserve & document** (CPCB/EPA breakpoints, breathing rates, ODEs, WTW factors) |
| **User-Configurable Defaults** | 3 | Preserve in local-first stores with full edit/reset/export |

---

## 2. Detailed Forensic Inventory

| ID | File & Location | Data / Implementation Identified | Classification | Problem / Risk | User Visible? | Scientific Impact? | Required Modification | Severity |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: | :--- | :---: |
| **F-01** | `src/features/assistant/AIAssistantWorkbench.tsx:33-89`, `src/services/ai/gemini-client.ts:51-120` | `localStorage.getItem('vayusensex_gemini_api_key')` & direct browser `fetch(...?key=${apiKey})` | **Hardcoded configuration / Security risk** | Stores/uses Gemini API key in browser `localStorage` and makes client-side Gemini HTTP calls | Yes | No | Remove browser `localStorage` API key input & client-side Gemini `fetch`; route all AI requests strictly through `/api/briefing` & `/api/assist` | **Critical** |
| **F-02** | `server.ts` (startup), `server/aiService.ts:7` | Missing `.env.local` loader; hardcoded fallback model `gemini-1.5-flash` | **Hardcoded configuration** | Express server does not load `.env.local` automatically; `gemini-1.5-flash` is outdated | Yes | No | Load `.env.local` / `.env` at `server.ts` startup; default `GEMINI_MODEL` to `gemini-2.5-flash` (configurable) with real `/api/health?probe=true` diagnostic | **Critical** |
| **F-03** | `src/features/mobility/MobilityWorkbench.tsx:17` | `const [ambientPm25, setAmbientPm25] = useState<number>(180);` | **Critical mock / disconnected data** | Ignores live selected city's $\text{PM}_{2.5}$ (e.g., shows 180 µg/m³ even when Bengaluru at 38 µg/m³ is selected) | Yes | Yes | Pass `currentOutdoorPm25` and `cityName` from `App.tsx` and synchronize via `useEffect` | **High** |
| **F-04** | `src/features/indoor/IndoorWorkbench.tsx:22` | `const [outdoorConcentration, setOutdoorConcentration] = useState<number>(currentOutdoorPm25);` | **Stale application data** | Initializes `useState` once on mount; changing city in Dashboard leaves Indoor CADR stale | Yes | Yes | Sync `outdoorConcentration` whenever `currentOutdoorPm25` updates via `useEffect` | **High** |
| **F-05** | `src/app/App.tsx:32, 64-70` | Initial `useState(SAMPLE_DELHI_SMOG)` & silent catch fallback to `SAMPLE_*` | **API fallback** | Before fetch completes or when Open-Meteo fails, UI displays sample data without an explicit offline/error banner | Yes | Yes | Track `apiError` and `provenance` (`LIVE` / `CACHED` / `STALE` / `OFFLINE`) explicitly and surface retry banner on failure | **High** |
| **F-06** | `src/features/assistant/AIAssistantWorkbench.tsx:44-82`, `server/aiService.ts:108` | Single-turn Q&A without conversation history or AI source status badge | **Incomplete GenAI integration** | No multi-turn conversation history, no copy/reset controls, and fallback vs live Gemini provenance not prominently surfaced | Yes | No | Add multi-turn `history`, copy/reset controls, loading states, and explicit Gemini vs Deterministic Fallback indicator | **High** |
| **F-07** | `src/domain/community/community-store.ts:116`, `src/features/community/CommunityHub.tsx:9` | Hardcoded default zone `'Anand Vihar Sector 4 Community'` | **Static application data** | Displays Delhi neighborhood name even when user selects another city | Yes | No | Pass active city name from `App.tsx` into `CommunityHub` and clearly label local-only scope | **Medium** |
| **F-08** | `src/domain/impact/impact-ledger.ts:100` | `Math.random().toString(36)` for entry ID | **Minor non-determinism** | Random ID generation when `crypto.randomUUID()` is available | No | No | Use `crypto.randomUUID()` when available with clean fallback | **Low** |
| **F-09** | `src/domain/mobility/dijkstra-router.ts:78-200` | `URBAN_NODES` & `CORRIDOR_PM25_MULTIPLIER` | **Modeled archetype / Legitimate assumption** | Synthetic 6-node urban graph & literature corridor multipliers | Yes | Disclosed | Keep deterministic Dijkstra engine; clearly badge in UI as "Modeled Urban Corridor Archetype (Not Live Street Traffic)" | **Medium** |
| **F-10** | `src/domain/aqi/cpcb.ts`, `usepa.ts`, `exposure/breathing-rates.ts`, `indoor/mass-balance.ts`, `sustainability/emission-factors.ts` | Regulatory breakpoints, EPA breathing rates, ODE equations, WTW factors | **Legitimate scientific constant** | Authoritative reference values | Yes | Core engine | **Preserve unchanged** and keep verified by 922 automated tests | **None (Valid)** |
| **F-11** | `src/domain/sample-data.ts` | `SAMPLE_DELHI_SMOG`, `SAMPLE_BENGALURU_MODERATE` | **API fallback / Test fixture** | Reference offline snapshots used when Open-Meteo is unreachable and in unit tests | Only if offline | Only if offline | Preserve strictly for offline/test fallback with explicit `OFFLINE / ILLUSTRATIVE` badge | **Low** |

---

## 3. Verification Method

1. Static scan via `Select-String` across `src/` for `Math.random`, `localStorage`, hardcoded `180`, `285.4`, `SAMPLE_`, and `VITE_GEMINI_API_KEY`.
2. Automated verification via `npm run typecheck`, `npm run lint`, `npm test` (922+ tests), and live API/Gemini health diagnostics.
