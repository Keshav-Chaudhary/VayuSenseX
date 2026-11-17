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
│   ├── ARCHITECTURE.md
│   ├── CALCULATIONS.md
│   └── DATA_SOURCES.md
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
│   │   │   ├── cpcb.ts
│   │   │   ├── usepa.ts
│   │   │   ├── calculator.ts
│   │   │   └── index.ts
│   │   ├── sample-data.ts
│   │   └── types.ts
│   ├── features/
│   │   ├── dashboard/
│   │   │   └── DashboardPage.tsx
│   │   ├── landing/
│   │   │   └── LandingPage.tsx
│   │   └── methodology/
│   │       └── MethodologyPage.tsx
│   ├── styles/
│   │   └── index.css
│   └── main.tsx
├── tests/
│   └── domain/
│       └── aqi.test.ts
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── README.md
├── SECURITY.md
├── tsconfig.json
└── vite.config.ts
```
