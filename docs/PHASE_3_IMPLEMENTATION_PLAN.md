# VayuSenseX — Phase 3 Implementation Plan
## Household Intelligence, Personalized Daily Planning & Grounded Generative AI

### 1. Mandatory Baseline Audit & Corrections
- **Git & Build Health:** Clean tree at `a1ea896`, 0 type errors, 25 tests passing, 0.33 MB repository size.
- **Audit Finding 1 (Data Provenance):** Open-Meteo European CAMS / ECMWF telemetry was labelled `OBSERVED`. This is technically a numerical atmospheric model analysis/forecast, not direct in-situ ground monitoring. We update this to `FORECAST` / `MODELLED_ANALYSIS` for scientific accuracy.
- **Audit Finding 2 (Nominatim Policy):** Ensure OpenStreetMap Nominatim queries send an explicit identification `User-Agent: VayuSenseX-Environmental-Decision-Platform/1.0`.
- **Audit Finding 3 (DIY Filtration):** Reinforce in UI that Corsi-Rosenthal throughput values are modelled engineering estimates subject to fan pressure drop and envelope sealing.

### 2. Phase 3 Architecture & Workflows

```
┌────────────────────────────────────────────────────────────────────────┐
│                   VAYUSENSEX PHASE 3 ARCHITECTURE                      │
└────────────────────────────────────────────────────────────────────────┘
                                    │
    ┌───────────────────────────────┼───────────────────────────────┐
    ▼                               ▼                               ▼
┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────────────┐
│  Household Domain &   │ │ Deterministic Routine │ │ Grounded Generative   │
│   Local Persistence   │ │   Planner & Optimizer │ │      AI Engine        │
│ (src/domain/household)│ │ (src/domain/planner/) │ │   (src/services/ai/)  │
├───────────────────────┤ ├───────────────────────┤ ├───────────────────────┤
│ - Household Profile   │ │ - Time-window scoring │ │ - Fact-ID Registry    │
│ - Family Members      │ │ - Constraint analysis │ │ - Gemini Client       │
│ - Home IAQ Attributes │ │ - Exposure optimizer │ │ - Grounding Validator │
│ - Daily Routine Store │ │ - Multi-objective     │ │ - Structured Zod JSON │
│ - Versioned Migration │ │ - Action Recommendations│ - Zero-Hallucination  │
└───────────────────────┘ └───────────────────────┘ └───────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     Interactive UI Workbenches                         │
│  - Household & Family Profile Manager (HouseholdWorkbench.tsx)         │
│  - Daily Action Routine Planner (PlannerWorkbench.tsx)                 │
│  - Ask VayuSenseX AI Assistant Panel with Fact-ID Inspector            │
└────────────────────────────────────────────────────────────────────────┘
```

### 3. Execution Sequence
1. **Audit Fixes:** Correct Open-Meteo provenance to `FORECAST` / `MODEL_ANALYSIS` and add user-agent header to Nominatim requests.
2. **Household Intelligence Engine (`src/domain/household/`):**
   - Profile schemas, family sensitivity preferences (non-clinical, voluntary).
   - Home filtration and room configuration.
   - Versioned local-first storage manager (`household-store.ts`).
3. **Daily Routine Planner Engine (`src/domain/planner/`):**
   - Environmental forecast window evaluator (`time-windows.ts`).
   - Feasible schedule optimizer (`schedule-optimizer.ts`).
   - Actionable recommendations with impact deltas (`recommendations.ts`).
4. **Grounded Generative AI Layer (`src/services/ai/`):**
   - Fact Registry (`fact-registry.ts`) collecting authorized Fact IDs from all deterministic engines.
   - Gemini client with structured JSON output and fallback resilience (`gemini-client.ts`).
   - Strict Grounding Validator (`grounding-validator.ts`) rejecting unauthorized numeric claims.
   - Deterministic Fallback Generator (`ai-fallback.ts`).
5. **UI Workbenches:**
   - `HouseholdWorkbench.tsx`: Complete profile, member, and home manager.
   - `PlannerWorkbench.tsx`: Interactive hourly daily schedule with cleaner-window recommendations and status toggles (planned/completed/skipped).
   - `AIAssistantWorkbench.tsx`: Ask VayuSenseX with Fact-ID grounding inspector.
6. **Integration & Automated Verification:**
   - Vitest unit tests for household, planner, and fact-ID validation.
   - Strict typecheck, build, and repository-size audit.
   - Documentation updates (`AI_GROUNDING.md`, `PLANNER_DESIGN.md`, `PRIVACY.md`, `PHASE_3_IMPLEMENTATION_REPORT.md`).
