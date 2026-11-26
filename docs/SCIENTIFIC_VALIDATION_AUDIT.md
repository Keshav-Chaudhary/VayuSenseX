# VayuSenseX — Scientific Validation & Data Integrity Audit

**Audit Date:** November 21, 2026  
**Auditor Role:** Independent Scientific Computing & Environmental Systems Auditor  
**Scope:** Dimensional correctness, empirical parameter classification, mathematical boundary conditions, and literature traceability across all 9 deterministic domain engines.

---

## 1. Traceability Matrix: Mathematical Engines & Literature Provenance

| Domain Engine | Governing Formula & Dimensional Equation | Empirical Status | Primary Published Scientific Source | Automated Test Suite | Verification Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **Indian CPCB NAQI** | $I = \frac{I_{hi} - I_{lo}}{B_{hi} - B_{lo}} (C - B_{lo}) + I_{lo}$<br>Unit: Unitless index ($0 - 500$) | **Official Standard** | Central Pollution Control Board (CPCB), *National Air Quality Index Guidelines*, Ministry of Environment, Forest and Climate Change, Govt. of India (2014). | `tests/domain/aqi.test.ts`<br>`tests/domain/aqi-breakpoints.test.ts` | **VERIFIED (Exact match)** |
| **US EPA AQI** | Piecewise linear interpolation across 6 health risk categories | **Official Standard** | US Environmental Protection Agency, *Technical Assistance Document for Reporting Daily Air Quality* (EPA-454/B-18-007, updated 2024 PM2.5 standards). | `tests/domain/aqi.test.ts`<br>`tests/domain/aqi-breakpoints.test.ts` | **VERIFIED (Exact match)** |
| **Indoor Mass Balance** | $\frac{dC_{in}}{dt} = P \lambda C_{out} + \frac{S}{V} - (\lambda + k + \frac{\eta Q}{V}) C_{in}$<br>Unit: $\mu\text{g/m}^3$ | **Published Physics Model** | Nazaroff, W. W. (2004). *Indoor particle dynamics*. Indoor Air, 14(s7), 175-183. | `tests/domain/indoor.test.ts`<br>`tests/domain/indoor-physics.test.ts` | **VERIFIED (Analytical ODE)** |
| **CADR Airflow Sizing** | $\text{CADR} \ge \frac{2}{3} \times \text{Floor Area}$ ($ACH \ge 5.0/\text{hr}$ for severe smog)<br>Unit: $\text{m}^3/\text{hr}$ | **Industry Standard** | Association of Home Appliance Manufacturers (AHAM) Standard AC-1-2020. | `tests/domain/indoor-physics.test.ts` | **VERIFIED** |
| **Inhaled Particulate Dose** | $D = \sum_{i} C_i \cdot BR_i \cdot \Delta t_i$<br>Unit: Micrograms ($\mu\text{g}$) | **Published EPA Methodology** | US EPA *Exposure Factors Handbook: 2011 Edition* (EPA/600/R-09/052F, Chapter 6: Inhalation Rates). | `tests/domain/exposure.test.ts`<br>`tests/domain/exposure-dose.test.ts` | **VERIFIED (Physical mass intake)** |
| **Ventilation Index** | $V_c = U \cdot H_m$<br>Unit: $\text{m}^2/\text{s}$ (wind speed in $\text{m/s} \times \text{PBLH in m}$) | **Micrometeorological Model** | Pasquill, F. & Smith, F. B. (1983). *Atmospheric Diffusion*. Ellis Horwood Ltd. | `tests/domain/smog-dispersion.test.ts` | **VERIFIED** |
| **Well-to-Wheel Transport** | Lifecycle emissions per passenger-kilometer ($g\ \text{CO}_2e/\text{p}\cdot\text{km}$)<br>National grid factor: $0.716\text{ kg CO}_2e/\text{kWh}$ | **Published National Baseline** | India GHG Program, CEEW Transport Matrix, and Central Electricity Authority (CEA) CO2 Baseline Database (Version 19, 2024). | `tests/domain/sustainability.test.ts` | **VERIFIED** |
| **Corridor PM2.5 Multipliers** | Arterial Highway: 1.45, Mixed Commercial: 1.20, Greenway: 0.65, Metro: 0.25 | **Configurable Scenario Assumptions** | Calibrated against street canyon and vegetative barrier dispersion ranges (Kumar et al., 2015; Gallagher et al., 2015). | `tests/domain/mobility-corridors.test.ts`<br>`tests/domain/mobility-adversarial.test.ts` | **VERIFIED AS SCENARIO MODEL** |
| **Vehicle Cabin Attenuation** | In-cabin penetration: Metro (0.15), Car recirc (0.45), Bus (0.65), Active (1.00) | **Parametric Scenario Assumptions** | Calibrated against automotive cabin MERV/HEPA recirculation studies (Hudda & Fruin, 2013). | `tests/domain/mobility-corridors.test.ts` | **VERIFIED AS SCENARIO MODEL** |

---

## 2. Dimensional Correctness & Unit Separation Audit

A core finding of this audit is that VayuSenseX strictly enforces **dimensional separation**:
1. **Emissions vs Exposure vs Dose:**
   - **Tailpipe / Lifecycle Emissions:** Quantified strictly in grams or kilograms of carbon dioxide equivalent ($g\ \text{CO}_2e$, $\text{kg}\ \text{CO}_2e$).
   - **Corridor Ambient Concentration:** Quantified strictly in mass concentration ($\mu\text{g/m}^3$).
   - **Inhaled Dose:** Quantified strictly in physical particulate mass inhaled into the respiratory tract ($\mu\text{g}$).
   - **Invariant Guarantee:** The application **never** treats reduced $\text{CO}_2e$ emissions as equivalent to reduced inhaled $\text{PM}_{2.5}$ dose. Each metric is evaluated in its own scientific dimension.
2. **Ventilation Unit Conversions:**
   - Respiration rates in `src/domain/exposure` are stored in $\text{m}^3/\text{hr}$ and converted consistently with time intervals in hours ($\Delta t = \text{minutes} / 60$).
   - Mobility router respiration rates are stored in $\text{m}^3/\text{min}$ and multiplied directly by segment durations in minutes. Dimensional equivalence is verified.
3. **Non-Negative Mass Invariants:**
   - All concentrations ($C \ge 0$), volumes ($V > 0$), durations ($t \ge 0$), and calculated doses ($D \ge 0$) are strictly guarded against negative values and `NaN` propagation.

---

## 3. Parametric Sensitivity & Uncertainty Disclosure

### Corridor Multipliers Uncertainty
The microclimate corridor multipliers ($1.45\times$, $1.20\times$, $0.65\times$, $0.25\times$) are documented in the codebase and user interface as **calibrated scenario parameters**, not invariant universal constants. In real urban topographies, roadside concentration is governed by dynamic wind vector angles, building height-to-width ratios ($H/W$), and thermal convection.

### Inhaled Dose Biological Caveat
The calculated inhaled particulate dose ($D = \sum C \cdot BR \cdot \Delta t$) measures **intake mass** entering the upper airway. It is explicitly labeled in the UI as an engineering intake estimate, NOT clinical internal alveolar deposition fraction or personalized toxicological risk.
