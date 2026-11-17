# VayuSenseX — Phase 1 & Phase 2 Implementation Plan
## Scientific Intelligence Engine + Live Environmental Data Infrastructure

### 1. Baseline Verification & Status
- **Git Status:** Clean master branch at initial commit `5ebedbd`.
- **TypeScript:** Strict mode enabled, 0 type errors.
- **Unit Tests:** 9 tests passing for CPCB and US EPA AQI sub-index calculations.
- **Tracked Repository Size:** 0.186 MB (Safe within the 10 MB limit).

### 2. Execution Phases & Workflows

#### Phase 1: Advanced Deterministic Scientific Engines
1. **Atmospheric Stagnation & Smog Intelligence (`src/domain/smog/`)**:
   - `stagnation.ts`: Planetary Boundary Layer Height (PBLH) & wind speed scoring.
   - `inversion.ts`: Detection of inversion-compatible thermal conditions (strictly labeled as compatible, not direct sounding measurements).
   - `dispersion.ts`: Ventilation index ($VI = PBLH \times U$) and multi-pollutant accumulation classification.
   - `index.ts`: Unified export.
2. **Indoor Air Quality Mass-Balance Engine (`src/domain/indoor/`)**:
   - `mass-balance.ts`: Analytical and step-wise ODE solver:
     $$\frac{dC_{in}}{dt} = P \lambda C_{out} + \frac{S}{V} - \left(\lambda + k + \frac{\eta Q}{V}\right) C_{in}$$
   - `cadr.ts`: Room volume ($L \times W \times H$), CADR, Air Changes per Hour ($ACH$).
   - `ventilation.ts`: Dynamic window-opening optimization based on outdoor concentration thresholds.
   - `indoor-sources.ts`: Incense, cooking, candle emissions ($S$) & DIY box-fan (Corsi-Rosenthal style) modeling.
3. **Exposure and Inhaled Dose Engine (`src/domain/exposure/`)**:
   - `breathing-rates.ts`: US EPA Exposure Factors Handbook volumetric breathing rates (sleep, sedentary, walking, cycling, heavy exercise).
   - `dose.ts`: Multi-segment cumulative dose $D = \sum (C_t \cdot BR_t \cdot \Delta t)$.
   - `activity.ts`: Schedule modeling across indoor/outdoor contexts.
4. **Transportation & Household Emission Engine (`src/domain/sustainability/`)**:
   - `emission-factors.ts`: Documented emission factors ($g CO_2e / passenger\cdot km$).
   - `transport.ts`: Tailpipe vs lifecycle emission comparisons across car, bike, bus, metro, cycle, walk.
   - `household.ts`: Household fuel emissions (LPG, electricity, biomass).
5. **Deterministic Scenario Comparison (`src/domain/scenarios/`)**:
   - `scenario-engine.ts`: Side-by-side comparison of baseline vs optimized lifestyle routines.

#### Phase 2: Live Environmental Data Infrastructure
1. **Data Ingestion & Provider Schemas (`src/services/environment/`)**:
   - Open-Meteo Air Quality & CAMS variables ($PM_{2.5}, PM_{10}, NO_2, O_3, SO_2, CO$).
   - Open-Meteo Weather variables ($PBLH$, wind speed/direction, temp, humidity).
   - OpenStreetMap / Nominatim Geocoding API for city search.
2. **Normalization & Data Quality**:
   - Zod runtime validation.
   - Provenance tagging: `Observed`, `Forecast`, `Calculated`, `Estimated`, `Illustrative`.
   - Caching layer with TTL and request deduplication.
   - Graceful offline and error states.

#### Phase 3: Comprehensive UI Integration
1. Extend `DashboardPage.tsx` with live location search, hourly forecasts, and detailed atmospheric telemetry.
2. Add dedicated tabbed workbenches:
   - **Indoor Air Quality & DIY Purifier Sizer**
   - **Inhaled Dose & Routine Exposure Planner**
   - **Transportation & Emission Offsets**
   - **What-If Scenario Simulator**
3. Enhance `MethodologyPage.tsx` with all mathematical models and documentation.
