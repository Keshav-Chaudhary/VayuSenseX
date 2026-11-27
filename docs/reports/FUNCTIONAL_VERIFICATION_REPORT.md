# VayuSenseX — Functional & Build Verification Report (`FUNCTIONAL_VERIFICATION_REPORT.md`)

**Date:** 2026-11-26  
**Verification Scope:** Static Analysis, TypeScript, Automated Tests (Unit, Integration, SSR, JSDOM), Production Bundle Build, Repository Size Audit

---

## 1. Automated Verification Results

| Check | Command | Result | Details |
| :--- | :--- | :---: | :--- |
| **Static Lint** | `npm run lint` (`oxlint src server server.ts`) | **PASS** | `0 errors` (11 minor warnings across 85 files in `64ms`) |
| **Strict Typecheck** | `npm run typecheck` (`tsc --noEmit`) | **PASS** | `0 errors` (`strict`, `noUnusedLocals`, `noUnusedParameters`, `noUncheckedIndexedAccess`) |
| **Test Suite** | `npm test` (`vitest run --no-file-parallelism`) | **PASS** | **922 / 922 tests passing** across **32 test files** (`14.20s`) |
| **Production Build** | `npm run build` (`tsc -b && vite build`) | **PASS** | Built in `5.16s`; main JS chunk `406.42 kB` (`120.84 kB` gzip) with lazy workbench splitting |
| **Repo Size Limit** | `npm run check-size` | **PASS** | **0.848 MB / 10.000 MB** (`9.15 MB` buffer remaining) |

---

## 2. Route & Workbench Synchronization Matrix

| Route / View | Data Source | Verified Behavior |
| :--- | :--- | :--- |
| `landing` | `App.tsx` live `snapshot` | CPCB/US EPA toggle, floating `GlobalHeader`, launch CTA |
| `dashboard` | Open-Meteo CAMS + Weather | City presets, geocoding search, explicit `telemetryError` alert, `.sr-only` forecast twin, `role="alert"` inversion banner |
| `household` | `HouseholdStore` (`localStorage`) | Editable members/rooms, JSON export/import |
| `planner` | `hourlyForecast` + `HouseholdProfile` | Deterministic cleanest-hour window optimization |
| `assistant` | `/api/briefing`, `/api/assist`, `/api/health` | Multi-turn conversation, Fact-ID grounding inspector, copy/reset, server-only key custody |
| `indoor` | `currentOutdoorPm25` synced via `useEffect` | Live city $\text{PM}_{2.5}$ propagation into ODE mass-balance & CADR sizing |
| `exposure` | `currentOutdoorPm25` + EPA breathing rates | Demographic & activity dose calculation |
| `mobility` | `currentOutdoorPm25` + `currentCity` synced | 3-way Dijkstra pathfinder (`EXPOSURE`, `TIME`, `DISTANCE`) + WTW lifecycle offsets |
| `impact` | `ImpactLedgerStore` | Deduplicated JSON import, status reversion zeroing, `crypto.randomUUID()` IDs |
| `community` | `CommunityStore` + `currentCity` | Local-first pledges & anonymous local aggregations |
| `simulator` | `currentOutdoorPm25` | Interactive counterfactual scenarios |
| `methodology` | Regulatory constants | CPCB & US EPA breakpoint documentation |

---

## 3. Local & Firebase Deployment Commands

```bash
# 1. Local full-stack development (Backend + Frontend proxy)
# Terminal 1: Express 5 Gateway on :3001 (reads .env.local)
npm run server:dev
# Terminal 2: Vite dev server on :3000 (proxies /api -> :3001)
npm run dev

# 2. Firebase Hosting static deployment (Project ID: vayusense-x)
npm run deploy
```

> **Note on Firebase Deployment:** `firebase.json` deploys the static `dist/` SPA to Firebase Hosting (`vayusense-x`), where the frontend automatically uses the deterministic fallback if `/api/*` is not hosted. For full-stack Express 5 + server-side Gemini execution in production, deploy using **Firebase App Hosting** (`apphosting.yaml`) with `GEMINI_API_KEY` configured as a secret in Firebase App Hosting / Cloud Secret Manager.
