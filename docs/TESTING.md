# VayuSenseX — Automated Testing & Verification Suite

## 1. Test Suite Summary & Metrics

VayuSenseX features a comprehensive, multi-layered automated verification suite executed via Vitest 5.1:

| Metric | Measured Value | Standard |
| :--- | :---: | :--- |
| **Total Test Suites** | **21 Suites** | 100% Passing |
| **Total Automated Tests** | **80 Tests** | 100% Passing |
| **Test Failures** | **0 Failures** | Zero-Defect Policy |
| **TypeScript Compilation Errors** | **0 Errors** | Strict mode enforced |
| **Execution Duration** | **~5.3 seconds** | Fast feedback loop |

---

## 2. Test Suites Directory & Coverage Matrix

| Test Suite File | Scope & Capabilities Verified | Tests Count |
| :--- | :--- | :---: |
| `tests/domain/aqi.test.ts` | Multi-pollutant AQI calculation, critical pollutant assignment, Indian CPCB vs US EPA category thresholds | 9 |
| `tests/domain/aqi-breakpoints.test.ts` | Exact breakpoint boundary tests (0, 30, 60, 90, 120, 250, 380, 500), linear piecewise interpolation | 3 |
| `tests/domain/indoor.test.ts` | Single-zone mass-balance ODE, decay curves, CADR sizing ratios, DIY Box Fan filtration | 5 |
| `tests/domain/indoor-physics.test.ts` | Steady-state infiltration physics, HEPA percentage attenuation (>85%), ANSI/AHAM 5.0 ACH sizing | 4 |
| `tests/domain/exposure.test.ts` | US EPA Inhaled dose formula $D = \sum C \cdot BR \cdot \Delta t$, microenvironment dose aggregation | 2 |
| `tests/domain/exposure-dose.test.ts` | Physiological ventilation rates (sleep to heavy exercise), child vulnerability, 24-hour daily schedules | 4 |
| `tests/domain/mobility-corridors.test.ts` | Microclimate corridor multipliers (highway 1.45x, canopy 0.65x, metro 0.25x), cabin penetration | 5 |
| `tests/domain/dijkstra-router.test.ts` | Graph-based Dijkstra pathfinding for lowest exposure vs fastest time, mode comparisons | 6 |
| `tests/domain/impact-ledger.test.ts` | Deduplication hash, anti-double-counting guard (planned/suggested = 0 realized), status transitions | 5 |
| `tests/domain/impact-extended.test.ts` | Category breakdowns, date-range filtering, JSON export and import verification | 2 |
| `tests/domain/community.test.ts` | Evidence-based community pledges, daily completion logging, anonymous privacy-preserving aggregation | 5 |
| `tests/domain/household.test.ts` | Sharma Family archetype profile, local-first persistence, JSON export/import | 3 |
| `tests/domain/planner.test.ts` | Deterministic routine optimization, morning smog shift to clean afternoon windows | 1 |
| `tests/domain/planner-extended.test.ts` | Vulnerable child asthma protection, non-negative dose invariants, empty forecast fallback | 3 |
| `tests/domain/scenarios.test.ts` | What-if scenario counterfactual simulations across room sealing and HEPA filtration | 1 |
| `tests/domain/smog.test.ts` | Atmospheric stagnation index, ventilation coefficient $V_c = U \cdot H_m$, boundary-layer inversion | 4 |
| `tests/domain/sustainability.test.ts` | Well-to-Wheel lifecycle emissions, tree planting equivalence (~21.77 kg CO2e/tree/year) | 2 |
| `tests/api/ai-grounding.test.ts` | Fact-ID Grounding Registry, anti-hallucination tolerance validator ($\pm 5\%$), deterministic fallback | 5 |
| `tests/api/open-meteo.test.ts` | Live CAMS and Open-Meteo European Ensemble data transformations, fallback telemetry | 2 |
| `tests/api/server-gateway.test.ts` | Express security gateway, SHA-256 LRU cache hit/miss, IP rate limiter (30 req/min, HTTP 429) | 4 |
| `tests/server/server-ai-service.test.ts` | Server-side Gemini execution, grounded deterministic briefing fallback, sub-50ms execution | 5 |
| **TOTAL** | **21 Test Suites** | **80 Tests** |

---

## 3. How to Run the Verification Suite

```bash
# Run complete TypeScript compilation verification
npm run typecheck

# Run full Vitest automated test suite
npm test

# Run repository size audit (< 10 MB limit)
npm run check-size

# Run production build
npm run build
```
