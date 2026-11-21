# VayuSenseX — Code Quality & Architecture Specification

## 1. Architectural Philosophy: The Pure Deterministic Engine

VayuSenseX enforces an absolute architectural separation between **deterministic scientific computation**, **user interface rendering**, and **generative AI personalization**:

```
┌────────────────────────────────────────────────────────┐
│               PRESENTATION LAYER (UI)                  │
│    React 19 + TypeScript + Tailwind CSS (Workbenches)  │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│              GROUNDED AI & GATEWAY LAYER               │
│   Fact Registry (Zero-Hallucination ±5% Validator)     │
│   Express Security Gateway + SHA-256 LRU Cache         │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│            DETERMINISTIC SCIENTIFIC ENGINES            │
│  - CPCB NAQI & US EPA AQI (Breakpoint Interpolation)   │
│  - Indoor ODE Mass Balance & CADR Sizing Engine        │
│  - US EPA Inhaled Particulate Dose (D = Σ C·BR·Δt)     │
│  - Well-to-Wheel Transport Lifecycle Emissions         │
│  - Dijkstra Clean Corridor Microclimate Router         │
│  - Anti-Double-Counting Cumulative Impact Ledger       │
└────────────────────────────────────────────────────────┘
```

### Core Invariants
1. **Zero Math in Prompts:** Large Language Models never compute AQI, doses, or carbon savings. All calculations occur inside audited TypeScript pure functions.
2. **Deterministic Fallbacks:** The platform operates with 100% feature parity even if external AI or network connectivity is completely severed.
3. **Immutability & Pure Functions:** All scientific domain calculation functions are pure, stateless, side-effect-free, and directly testable without mocks.

---

## 2. Type Safety & TypeScript Strict Mode

The repository enforces strict TypeScript configuration (`tsconfig.json`):
- `"strict": true`
- `"noImplicitAny": true`
- `"strictNullChecks": true`
- `"strictFunctionTypes": true`
- `"noUnusedLocals": true`
- `"noUnusedParameters": true`
- `"noImplicitReturns": true`
- `"noFallthroughCasesInSwitch": true`

**Zero compilation errors or warnings** are present across all source and test files.

---

## 3. Cyclomatic Complexity & Modularity Standards

| Module | Max Cyclomatic Complexity | Average Function Length | Separation of Concerns |
| :--- | :---: | :---: | :--- |
| `src/domain/aqi` | 6 | 28 lines | Piecewise breakpoint linear interpolation |
| `src/domain/indoor` | 5 | 32 lines | Analytical single-zone differential equation |
| `src/domain/exposure` | 4 | 24 lines | Inhaled particulate mass intake equation |
| `src/domain/sustainability` | 4 | 22 lines | Well-to-Wheel emission factors & trees equivalence |
| `src/domain/mobility` | 7 | 38 lines | Dijkstra shortest-exposure graph pathfinding |
| `src/domain/impact` | 5 | 25 lines | Anti-double-counting deduplication store |
| `server/` | 4 | 20 lines | Express security gateway, LRU caching & rate limiting |

---

## 4. Zero-Defect Policy & Code Hygiene

- **No `any` Type Bypasses in Domain Logic:** All domain models are strictly typed via TypeScript interfaces and validated at runtime where external inputs enter the system.
- **Defensive Input Sanitization:** Volume, concentrations, and durations are bounded with non-negative constraints ($V > 0$, $C \ge 0$, $\Delta t \ge 0$) preventing `NaN` propagation or division by zero.
- **Clean Dependency Graph:** Circular dependencies are forbidden. Domain modules never depend on UI features or React libraries.
