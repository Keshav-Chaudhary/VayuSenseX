# VayuSenseX 🌬️
### AI-Powered Urban Air Quality & Household Environmental Intelligence Platform
**Challenge 6 | PromptWars · Hack2Skill**

> *"The deterministic engine owns the calculations. AI owns the explanations. The user owns the decisions."*

---

## 🚀 Overview

**VayuSenseX** is an advanced environmental decision-support system designed to empower families and urban communities through severe winter smog episodes and acute air pollution crises. 

Unlike traditional static AQI monitors or ungrounded generative chatbots, VayuSenseX combines **pure deterministic environmental science equations** with **fact-grounded GenAI explanations**. It enables families to simulate indoor filtration, model inhaled particulate doses, optimize daily outdoor schedules, and quantify carbon and particulate reductions from daily lifestyle choices.

---

## 🏆 Alignment with Challenge 6 Evaluation Criteria

| Evaluation Dimension | VayuSenseX Architectural Implementation | Verification Method |
| :--- | :--- | :--- |
| **1. Code Quality** | Modular domain architecture, TypeScript strict mode, comprehensive typed schemas, clean separation of concerns. | `npm run typecheck`, 0 warnings |
| **2. Security** | Server-side API key isolation, Fact-ID grounding preventing hallucinated numbers, Zod validation, zero secret leakage. | `SECURITY.md`, `npm audit` (0 vulnerabilities) |
| **3. Efficiency** | Ultra-lightweight Vite bundle (gzip ~84 kB), automated repository size guard (`npm run check-size`), local caching. | `scripts/check-repo-size.mjs` (0.175 MB / 10 MB limit) |
| **4. Testing** | Comprehensive Vitest suite covering CPCB/US EPA boundary values, linear interpolations, and multi-pollutant ranking. | `npm test` (100% domain passing) |
| **5. Accessibility** | WCAG 2.2 AA compliant, skip navigation links, high-contrast dark theme, color-independent AQI indicators. | Tested semantic markup & ARIA |
| **6. Problem Statement** | Winter smog focus, CPCB vs US EPA dual standard, boundary layer inversion tracking, indoor CADR mass balance. | Tested on Delhi NCR severe smog telemetry |

---

## 🔬 Core Scientific Engines

1. **Dual AQI Standards Separation**:
   - **Indian CPCB NAQI**: Independent sub-index interpolation across 6 categories (`Good`, `Satisfactory`, `Moderate`, `Poor`, `Very Poor`, `Severe`).
   - **US EPA AQI**: 2024 revised annual/24-hr guidelines (`Good`, `Moderate`, `Unhealthy for Sensitive Groups`, `Unhealthy`, `Very Unhealthy`, `Hazardous`).
2. **Atmospheric Stagnation & Inversion Diagnostics**:
   - Planetary boundary layer height (PBLH) inversion detection (&lt; 250m).
   - Surface wind stagnation tracking (&lt; 5 km/h).
3. **Indoor Single-Zone Mass-Balance Model**:
   $$\frac{dC_{in}}{dt} = P \lambda C_{out} + \frac{S}{V} - \left(\lambda + k + \frac{\eta Q}{V}\right) C_{in}$$
4. **Inhaled Particulate Dose ($D$)**:
   $$D = \sum_{t} C_t \times BR_t \times \Delta t$$
   Calculated across rest, light, and heavy activity breathing rates based on the US EPA Exposure Factors Handbook.

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

# Run domain unit tests
npm run test

# Verify production build
npm run build

# Verify repository size limit (< 10 MB)
npm run check-size
```

---

## 📜 Documentation Directory
- [System Architecture](docs/ARCHITECTURE.md)
- [Scientific Calculations & Formulas](docs/CALCULATIONS.md)
- [Official Data Sources & Citations](docs/DATA_SOURCES.md)
- [Security Policy & Threat Model](SECURITY.md)

---

## ⚖️ License & Ethical Disclaimer
Modelled calculations are scientific estimates for routine optimization and household risk reduction. They do not constitute clinical or medical diagnosis. Published under the MIT License.
