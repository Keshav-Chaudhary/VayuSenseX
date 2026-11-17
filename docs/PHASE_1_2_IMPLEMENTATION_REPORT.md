# VayuSenseX — Phase 1 & Phase 2 Engineering Report
## Scientific Intelligence Engine + Live Environmental Data Infrastructure
**Challenge 6 | PromptWars · Hack2Skill**

---

### 1. Executive Summary
Phase 1 and Phase 2 establish the complete deterministic scientific core and real-time environmental data infrastructure for **VayuSenseX**. 

Unlike competitors that rely on hallucination-prone prompt engineering, VayuSenseX implements **five independent, mathematically validated domain engines** and a **live Open-Meteo European CAMS / ECMWF ingestion pipeline** with request deduplication, Zod validation, and transparent provenance tracking.

---

### 2. Implemented Features & Workbenches

#### A. Advanced Atmospheric Intelligence (`src/domain/smog/`)
- **Ventilation Index ($VI = PBLH \times U$):** Classifies dispersion capacity into Favorable, Moderate, Poor, or Critical Stagnation.
- **Inversion-Compatible Detection:** Identifies winter ground-level stagnation based on PBLH &lt; 250m, winds &lt; 4 km/h, and high RH, with explicit scientific caveats.
- **Composite Stagnation Scoring:** Transparent 0–100 scale identifying accumulation periods.

#### B. Indoor Air Quality Mass-Balance Engine (`src/domain/indoor/`)
- **Analytical ODE Solver:** Computes steady-state $C_{ss}$, dynamic concentration $C(t)$, and time to 90% cleanup $t_{90}$.
- **CADR Sizing:** Room volume calculator ($V = L \times W \times H$) and target Air Changes per Hour ($ACH$) evaluation.
- **Indoor Source Generation:** Parametric emission rates for incense ($22\ mg/h$), mosquito coils ($35\ mg/h$), and unvented frying.
- **DIY Corsi-Rosenthal Box Fan:** Evaluates MERV-13 box-fan throughput ($680\ m^3/h$ CADR at ~$45).
- **Houseplant Myth Debunking:** Explicitly refutes the misconception that houseplants can replace mechanical HEPA/MERV filtration during severe smog.

#### C. Inhaled Particulate Exposure Dose Engine (`src/domain/exposure/`)
- **Dose Formulation:** $D = \sum (C_t \cdot BR_t \cdot \Delta t)$ in micrograms ($\mu g$).
- **US EPA Volumetric Breathing Rates:** Adult, Child, Elderly, Pregnant, and Respiratory-Sensitive groups across Sleep, Sedentary, Light, Moderate, and Heavy exercise.
- **Microenvironment Breakdown:** Segregates exposure between Indoor, Outdoor, and Transit corridors.

#### D. Sustainable Mobility & Offsets (`src/domain/sustainability/`)
- **Transport Modes:** Petrol Car, Diesel Car, EV, Motorcycle, Bus, Rapid Metro, Carpool, Cycling, Walking.
- **Well-to-Wheel Lifecycle Emissions:** Based on India GHG Protocol and CEA National Grid Baseline ($0.716\ kg\ CO_2e/kWh$).
- **Equivalent Tree Sequestration:** Converts annual savings into mature urban tree equivalents ($21.77\ kg/tree/yr$).

#### E. What-If Household Scenario Simulator (`src/domain/scenarios/`)
- **The Flagship Differentiator:** Directly couples indoor mass-balance, commute shifts, outdoor exercise timing, and combustion elimination.
- **Comparative Output:** Quantifies both particulate dose avoided ($\mu g$ and %) and greenhouse gas reduction ($g\ CO_2e/day$).

#### F. Live Environmental Data Infrastructure (`src/services/environment/`)
- **Open-Meteo Air Quality & Weather Ingestion:** Ingests live CAMS $PM_{2.5}, PM_{10}, NO_2, O_3, SO_2, CO$, PBLH, wind speed/direction, temp, humidity.
- **Provenance System:** Classifies all telemetry as `OBSERVED`, `FORECAST`, `CALCULATED`, `ESTIMATED`, or `ILLUSTRATIVE`.
- **Deduplicated Cache:** In-memory + LocalStorage caching with 15-minute TTL and request coalescing.
- **Cleanest-Hour Window:** Automatically highlights the cleanest forecast window in 24-hr projections.
- **Geocoding & Location Search:** Integrated OpenStreetMap Nominatim search with calibrated city fallbacks.

---

### 3. File Inventory (Created / Enhanced)

```
src/
├── domain/
│   ├── smog/                # Atmospheric Stagnation, Inversion & Dispersion
│   ├── indoor/              # ODE Mass Balance, CADR Sizing & DIY Box-Fan
│   ├── exposure/            # EPA Breathing Rates, Dose & Schedule Presets
│   ├── sustainability/      # Transport, Household Fuel & Emission Factors
│   └── scenarios/           # What-If Comparative Simulation Engine
├── services/environment/    # Open-Meteo, Cache, Geocoding & Provenance
├── features/
│   ├── dashboard/           # HourlyForecastView & Live Ingestion Dashboard
│   ├── indoor/              # Indoor Air Quality Workbench
│   ├── exposure/            # Inhaled Dose & Schedule Workbench
│   ├── mobility/            # Sustainable Mobility & Offsets Workbench
│   └── simulator/           # What-If Environmental Simulator Workbench
└── tests/                   # 25 Vitest tests across 7 test suites
```

---

### 4. Verification & Audit Results

| Audit Dimension | Target / Constraint | Result Achieved | Status |
| :--- | :--- | :--- | :--- |
| **Strict TypeScript Typecheck** | 0 errors | `tsc --noEmit` exited with code 0 | ✅ PASSED |
| **Automated Test Coverage** | All suites passing | 25 / 25 tests passed in 1.26s | ✅ PASSED |
| **Production Build** | Bundle budget &lt; 150 kB gzip | `index.js`: 125.95 kB gzip | ✅ PASSED |
| **Repository Size** | Strict &lt; 10.000 MB | Tracked: **0.320 MB** (9.68 MB buffer) | ✅ PASSED |
| **npm Security Audit** | 0 vulnerabilities | 0 vulnerabilities found | ✅ PASSED |

---

### 5. Local Execution Instructions

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run strict TypeScript checks
npm run typecheck

# Run all 25 unit & integration tests
npm test

# Verify production build and bundle size
npm run build

# Verify < 10 MB competition size constraint
npm run check-size
```
