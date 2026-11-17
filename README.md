# VayuSenseX 🌬️
### AI-Powered Urban Air Quality & Household Environmental Intelligence Platform
**Challenge 6 | PromptWars · Hack2Skill**

> *"The deterministic engine owns the calculations. AI owns the explanations. The user owns the decisions."*

---

## 🚀 Overview

**VayuSenseX** is an advanced environmental decision-support system designed to empower families and urban communities through severe winter smog episodes and acute air pollution crises.

Unlike traditional static AQI monitors or ungrounded generative chatbots, VayuSenseX combines **five pure deterministic environmental engineering engines** with **live European CAMS / ECMWF atmospheric telemetry** and **fact-grounded explanations**. It enables families to simulate indoor filtration, model inhaled particulate doses, optimize daily outdoor schedules, and quantify carbon and particulate reductions from daily lifestyle choices.

---

## 🏆 Current Implementation Status: Phase 1 & Phase 2 Complete

| Evaluation Dimension | VayuSenseX Architectural Implementation | Verification Method |
| :--- | :--- | :--- |
| **1. Code Quality** | Modular domain architecture, TypeScript strict mode, Zod schemas, zero unused exports/variables. | `npm run typecheck`, 0 errors |
| **2. Security** | Server-side API key isolation, Fact-ID grounding, Zod input validation, zero secret leakage. | `SECURITY.md`, `npm audit` (0 vulnerabilities) |
| **3. Efficiency** | Ultra-lightweight Vite bundle (gzip 125 kB), automated repository size guard (`npm run check-size`), local caching. | `scripts/check-repo-size.mjs` (0.320 MB / 10 MB limit) |
| **4. Testing** | Comprehensive Vitest suite covering CPCB/US EPA boundary values, ODE solvers, and API payloads. | `npm test` (25 / 25 passing) |
| **5. Accessibility** | WCAG 2.2 AA compliant, skip navigation links, high-contrast dark theme, color-independent AQI indicators. | Tested semantic markup & ARIA |
| **6. Problem Statement** | Winter smog focus, CPCB vs US EPA dual standard, boundary layer inversion tracking, indoor CADR mass balance. | Tested on Delhi NCR severe smog & live CAMS |

---

## 🔬 Core Scientific Engines & Workbenches

1. **Dual AQI Standards Separation**:
   - **Indian CPCB NAQI**: Independent sub-index interpolation across 6 categories (`Good`, `Satisfactory`, `Moderate`, `Poor`, `Very Poor`, `Severe`).
   - **US EPA AQI**: 2024 revised annual/24-hr guidelines (`Good`, `Moderate`, `Unhealthy for Sensitive Groups`, `Unhealthy`, `Very Unhealthy`, `Hazardous`).
2. **Atmospheric Stagnation & Inversion Diagnostics**:
   - Planetary Boundary Layer Height ($PBLH$) inversion-compatible condition detection (&lt; 250m).
   - Surface wind stagnation tracking (&lt; 4 km/h) and Ventilation Index ($VI = PBLH \times U$).
3. **Indoor Single-Zone Mass-Balance Model**:
   $$\frac{dC_{in}}{dt} = P \lambda C_{out} + \frac{S}{V} - \left(\lambda + k + \frac{\eta Q}{V}\right) C_{in}$$
   Analytical ODE solver for steady-state $C_{ss}$, cleanup time $t_{90}$, CADR room sizing ($CADR = V \times ACH$), DIY Corsi-Rosenthal box fans, and houseplant myth debunking.
4. **Inhaled Particulate Dose ($D$)**:
   $$D = \sum_{t} C_t \times BR_t \times \Delta t$$
   Calculated across rest, light, and heavy activity breathing rates based on the US EPA Exposure Factors Handbook.
5. **Sustainable Mobility & Lifecycle Emissions**:
   Well-to-Wheel greenhouse gas offsets ($g\ CO_2e$) comparing Petrol Car, Diesel Car, EV, Motorcycle, Bus, Rapid Metro, Carpool, Cycling, and Walking based on the India GHG Protocol and CEA National Grid Baseline ($0.716\ kg\ CO_2e/kWh$).
6. **What-If Household Scenario Simulator**:
   Interactive scenario testing comparing unmitigated baseline routines against protected family schedules, quantifying both particulate dose avoided ($\mu g$) and carbon avoided ($g\ CO_2e/day$).
7. **Live Atmospheric Data Infrastructure**:
   Open-Meteo European CAMS / ECMWF multi-pollutant live ingestion, OpenStreetMap Nominatim geocoding, 15-minute deduplicated caching, and transparent provenance tagging (`OBSERVED`, `FORECAST`, `CALCULATED`, `ESTIMATED`, `ILLUSTRATIVE`).

---

## 🛠️ Quick Start

### Prerequisites
- Node.js >= 18 (Tested on v24.20.0)
- npm >= 9

### Installation
```bash
# Clone the repository
git clone <repo-url>
cd PromptWars_Challenge6

# Install dependencies
npm install

# Start development server
npm run dev
```

### Verification Scripts
```bash
# Run strict TypeScript typecheck
npm run typecheck

# Run all 25 unit & integration tests
npm test

# Verify production build
npm run build

# Verify repository size limit (< 10 MB)
npm run check-size
```

---

## 📜 Documentation Directory
- [System Architecture](docs/ARCHITECTURE.md)
- [Scientific Calculations & Formulas](docs/CALCULATIONS.md)
- [Model Assumptions & Boundaries](docs/MODEL_ASSUMPTIONS.md)
- [Official Data Sources & Citations](docs/DATA_SOURCES.md)
- [Phase 1 & 2 Engineering Report](docs/PHASE_1_2_IMPLEMENTATION_REPORT.md)
- [Security Policy & Threat Model](SECURITY.md)

---

## ⚖️ License & Ethical Disclaimer
Modelled calculations are scientific estimates for routine optimization and household risk reduction. They do not constitute clinical or medical diagnosis. Published under the MIT License.
