# VayuSenseX System Architecture

## Architectural Philosophy
VayuSenseX is architected around a strict separation of concerns:
> **"The deterministic engine owns the calculations. AI owns the explanations. The user owns the decisions."**

```
┌─────────────────────────────────────────────────────────────┐
│                 Client Layer (React 19 + Vite)              │
│  - 10 Environmental Intelligence Workbenches                │
│  - Local-First Guest State (localStorage)                   │
│  - Accessible Responsive UI (WCAG 2.2 Level AA)             │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
┌───────────────────────────────┐ ┌───────────────────────────────┐
│     Deterministic Engine      │ │    Server Security Gateway    │
│        (src/domain/)          │ │           (server/)           │
│ - CPCB & US EPA Dual AQI      │ │ - Express Security Gateway    │
│ - PBLH Inversion Heuristics   │ │ - Helmet-Grade CSP + Nosniff  │
│ - Indoor Mass-Balance ODE     │ │ - 15 KB Payload Cap           │
│ - Inhaled Particulate Dose    │ │ - 30 req/min IP Rate Limiter  │
│ - Dijkstra Clean Router       │ │ - In-Memory SHA-256 LRU Cache │
│ - Impact Ledger & Dedup Hash  │ │ - Fact-ID Grounding Validator │
│ - Community Resilience Hub    │ │ - Deterministic AI Fallback   │
└───────────────────────────────┘ └───────────────────────────────┘
```

## Directory Structure
```
PromptWars_Challenge6/
├── .github/
│   └── workflows/
│       └── ci.yml
├── docs/
│   ├── ACCESSIBILITY.md
│   ├── AI_GROUNDING.md
│   ├── ARCHITECTURE.md
│   ├── CALCULATIONS.md
│   ├── CODE_QUALITY.md
│   ├── DATA_INTEGRITY_AUDIT.md
│   ├── DATA_SOURCES.md
│   ├── EFFICIENCY.md
│   ├── PHASE_4_IMPLEMENTATION_REPORT.md
│   ├── PROBLEM_ALIGNMENT.md
│   ├── SECURITY.md
│   └── TESTING.md
├── server/
│   ├── aiService.ts
│   ├── cache.ts
│   └── middleware.ts
├── server.ts
├── metadata.json
├── scripts/
│   └── check-repo-size.mjs
├── src/
│   ├── app/
│   │   └── App.tsx
│   ├── components/
│   │   └── layout/
│   │       ├── Navbar.tsx
│   │       └── Footer.tsx
│   ├── domain/
│   │   ├── aqi/
│   │   ├── community/
│   │   ├── exposure/
│   │   ├── household/
│   │   ├── impact/
│   │   ├── indoor/
│   │   ├── mobility/
│   │   ├── planner/
│   │   ├── scenarios/
│   │   ├── smog/
│   │   ├── sustainability/
│   │   ├── sample-data.ts
│   │   └── types.ts
│   ├── features/
│   │   ├── assistant/
│   │   ├── community/
│   │   ├── dashboard/
│   │   ├── exposure/
│   │   ├── household/
│   │   ├── impact/
│   │   ├── indoor/
│   │   ├── landing/
│   │   ├── methodology/
│   │   ├── mobility/
│   │   ├── planner/
│   │   └── simulator/
│   └── services/
│       ├── ai/
│       └── environment/
└── tests/
    ├── api/
    ├── domain/
    └── server/
```

## Verification & Key Architectural Guarantees
1. **Zero Hallucinated Numbers**: Grounding validator verifies generated numbers match the Fact Registry within $\pm 5\%$.
2. **Offline Resilience**: Full deterministic fallbacks operate if external AI or networks are offline.
3. **Local-First Privacy**: Household profiles and community pledges are stored client-side; zero PII sent to cloud.
4. **Anti-Double-Counting Guard**: Suggested and planned actions yield $0.0\,\mu\text{g}$ realized savings until marked completed.
5. **Physical Separation in Mobility**: Distinguishes tailpipe emissions ($g\ CO_2e/\text{km}$), corridor ambient PM2.5 ($\mu\text{g/m}^3$), and commuter inhaled dose ($\mu\text{g}$).
