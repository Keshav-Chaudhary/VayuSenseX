# VayuSenseX System Architecture

## Architectural Philosophy
VayuSenseX is architected around a strict separation of concerns:
> **"The deterministic engine owns the calculations. AI owns the explanations. The user owns the decisions."**

```
┌─────────────────────────────────────────────────────────────┐
│                 Client Layer (React 19 + Vite)              │
│  - Landing View · Atmospheric Dashboard · Methodology Docs │
│  - Local-First Guest State (localStorage)                   │
│  - Accessible Responsive UI (WCAG 2.2 AA)                   │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
┌───────────────────────────────┐ ┌───────────────────────────────┐
│     Deterministic Engine      │ │      GenAI Explanation        │
│        (src/domain/)          │ │        (Server/API)           │
│ - CPCB & US EPA Dual AQI      │ │ - Structured JSON             │
│ - PBLH Inversion Heuristics   │ │ - Fact-ID Grounding Validator │
│ - Indoor Mass-Balance ODE     │ │ - Zero Hallucinated Numbers   │
│ - Inhaled Particulate Dose    │ │ - Deterministic Fallback      │
└───────────────────────────────┘ └───────────────────────────────┘
```

## Directory Structure
```
PromptWars_Challenge6/
├── docs/
│   ├── AI_GROUNDING.md
│   ├── ARCHITECTURE.md
│   ├── CALCULATIONS.md
│   ├── DATA_SOURCES.md
│   ├── PHASE_1_2_IMPLEMENTATION_PLAN.md
│   ├── PHASE_3_IMPLEMENTATION_PLAN.md
│   ├── PHASE_3_IMPLEMENTATION_REPORT.md
│   ├── PLANNER_DESIGN.md
│   └── PRIVACY.md
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
│   │   ├── exposure/
│   │   ├── household/
│   │   ├── indoor/
│   │   ├── planner/
│   │   ├── scenarios/
│   │   ├── smog/
│   │   ├── sustainability/
│   │   ├── sample-data.ts
│   │   └── types.ts
│   ├── features/
│   │   ├── assistant/
│   │   │   └── AIAssistantWorkbench.tsx
│   │   ├── dashboard/
│   │   │   └── DashboardPage.tsx
│   │   ├── exposure/
│   │   │   └── ExposureWorkbench.tsx
│   │   ├── household/
│   │   │   └── HouseholdWorkbench.tsx
│   │   ├── indoor/
│   │   │   └── IndoorWorkbench.tsx
│   │   ├── landing/
│   │   │   └── LandingPage.tsx
│   │   ├── methodology/
│   │   │   └── MethodologyPage.tsx
│   │   ├── mobility/
│   │   │   └── MobilityWorkbench.tsx
│   │   ├── planner/
│   │   │   └── PlannerWorkbench.tsx
│   │   └── simulator/
│   │       └── SimulatorWorkbench.tsx
│   ├── services/
│   │   ├── ai/
│   │   │   ├── ai-fallback.ts
│   │   │   ├── fact-registry.ts
│   │   │   ├── gemini-client.ts
│   │   │   ├── grounding-validator.ts
│   │   │   └── types.ts
│   │   └── environment/
│   │       ├── geocoding.ts
│   │       ├── open-meteo.ts
│   │       └── types.ts
│   ├── styles/
│   │   └── index.css
│   └── main.tsx
├── tests/
│   ├── api/
│   │   ├── ai-grounding.test.ts
│   │   └── open-meteo.test.ts
│   └── domain/
│       ├── aqi.test.ts
│       ├── exposure.test.ts
│       ├── household.test.ts
│       ├── indoor.test.ts
│       ├── planner.test.ts
│       ├── scenarios.test.ts
│       ├── smog.test.ts
│       └── sustainability.test.ts
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── README.md
├── SECURITY.md
├── tsconfig.json
└── vite.config.ts
```
