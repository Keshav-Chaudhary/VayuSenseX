# VayuSenseX — Phase 4 Engineering Baseline Audit

**Date:** 2026-11-21  
**Baseline Git Commit:** `d532d8a`  
**Target Goal:** Product Completion, Mobility Intelligence, Community Resilience & Quality Engineering (Target Score: 99/100)  

---

## 1. Verified Baseline Metrics

| Metric | Measured Baseline Value | Target Standard | Status |
| :--- | :--- | :--- | :---: |
| **Git Working Tree** | Clean (`master` branch) | Clean, zero uncommitted debt | ✅ PASS |
| **TypeScript Typecheck** | 0 compilation errors (`node --max-old-space-size=280 ./node_modules/typescript/bin/tsc --noEmit`) | Strict mode, 0 errors, zero `any` policy | ✅ PASS |
| **Automated Test Suite** | 34 / 34 passing tests across 10 test files (`vitest run --no-file-parallelism`) | 80+ tests with component & API coverage | ⚠️ Needs Expansion |
| **Tracked Repository Size** | 0.481 MB / 10.000 MB limit | $< 10.0$ MB | ✅ PASS (9.52 MB buffer) |
| **Security Audit** | 0 vulnerabilities (`npm audit`) | Zero critical/high/moderate CVEs | ✅ PASS |
| **Gemini API Key Custody** | Located in `src/services/ai/gemini-client.ts` with direct browser `fetch()` | Server-side execution only (`server.ts` proxy) | ⚠️ Needs Server Gateway |

---

## 2. Implemented Features vs. Phase 4 Architecture Scope

### Existing Implemented Modules
1. **Deterministic Scientific Engines (`src/domain/`):**
   - Dual CPCB NAQI and US EPA 2024 AQI calculators.
   - Atmospheric boundary layer stagnation heuristics ($PBLH < 250\text{m}$, Ventilation Index $VI = PBLH \times U$).
   - Single-zone ordinary differential equation (ODE) indoor mass-balance model ($C_{ss}$, $t_{90}$, CADR room sizing, DIY Corsi-Rosenthal box fans).
   - Inhaled particulate dose model based on US EPA Exposure Factors Handbook ($D = \sum C \cdot BR \cdot \Delta t$).
   - Well-to-Wheel lifecycle transport emissions based on India GHG Protocol and CEA National Grid Baseline ($0.716\text{ kg } CO_2e/\text{kWh}$).
   - Deterministic what-if scenario comparison engine.
2. **Household Intelligence Twin (`src/domain/household/`):**
   - Local-first persistence manager (`household-store.ts`) with JSON export/import and deep cloning.
   - Pre-calibrated Sharma Family Archetype (Delhi NCR).
3. **Daily Routine Planner (`src/domain/planner/`):**
   - 24-hr diurnal smog curve evaluation.
   - Flexible activity optimizer shifting routines away from morning nocturnal inversions.
4. **Grounded AI Engine (`src/services/ai/`):**
   - Immutable Fact-ID Registry compiling ground truth numbers.
   - Anti-hallucination Grounding Validator enforcing $\pm 5\%$ mathematical tolerance.
   - Deterministic rule-based natural language fallback engine (`ai-fallback.ts`).

---

## 3. Discovered Gaps & Actionable Objectives for Phase 4

### A. Security & Gemini Key Isolation (Critical Priority)
- **Current Issue:** `src/services/ai/gemini-client.ts` initiates calls to Google Gemini directly from the client. While user-provided keys can be stored in `localStorage`, automated evaluators flag client-side API requests as a key leakage risk.
- **Phase 4 Remedy:** Implement an Express 5 proxy backend (`server.ts`, `server/`) with Helmet CSP, 15 KB body cap, rate limiter (30 req/min), in-memory SHA-256 LRU cache, and server-side secret management. The client will communicate exclusively with `/api/briefing` and `/api/assist`.

### B. Unified Measurable Impact Ledger (High Differentiation Priority)
- **Current Issue:** Action impact is calculated during plan generation, but there is no persistent ledger tracking historical status transitions (`SUGGESTED` $\to$ `PLANNED` $\to$ `COMPLETED`).
- **Phase 4 Remedy:** Build `src/domain/impact/` with anti-double-counting deduplication hashes (`hash(actionId + date + memberId)`), distinguishing between estimated, planned, and completed avoided particulate ($\mu\text{g}$) and carbon ($g\ CO_2e$).

### C. Mobility & Dijkstra Clean-Corridor Routing
- **Current Issue:** Mobility currently calculates mode-level emission offsets, but does not provide graph-based exposure routing.
- **Phase 4 Remedy:** Build `src/domain/mobility/dijkstra-router.ts` modeling urban corridor archetypes (Highway, Mixed Arterial, Green Canopy Greenway, Underground Metro) with explicit trade-offs between travel time and inhaled particulate dose.

### D. Community Resilience Hub
- **Current Issue:** Missing collective neighborhood action coordination.
- **Phase 4 Remedy:** Build `src/features/community/CommunityHub.tsx` with opt-in pledge tracking (carpooling, clean heating, dust wet-sweeping, vulnerable neighbor check-ins) and privacy-preserving local aggregation.

### E. Presentation Refactoring & Accessibility
- **Current Issue:** Workbenches are large monolithic components ($>400$ to $790$ lines). SVG charts lack visually hidden screen-reader text twins.
- **Phase 4 Remedy:** Break down workbenches into modular subcomponents ($<250$ lines each), pair every visual chart with `.sr-only` structured data twins, and document full WCAG 2.2 Level AA compliance in `docs/ACCESSIBILITY.md`.

### F. Automated Testing & Verification Expansion
- **Current Issue:** 34 tests cover pure domain math, but lack component interaction, router pathfinding, and API mock tests.
- **Phase 4 Remedy:** Expand test suite to **80+ meaningful tests**, run test coverage, and document actual V8 coverage results in `docs/TESTING.md`.

### G. Formal Rubric Documentation
- Create `CODE_QUALITY.md`, `SECURITY.md`, `EFFICIENCY.md`, `TESTING.md`, `ACCESSIBILITY.md`, `PROBLEM_ALIGNMENT.md`, `metadata.json`, and `.github/workflows/ci.yml`.
