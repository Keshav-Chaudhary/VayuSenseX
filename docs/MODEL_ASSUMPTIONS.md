# VayuSenseX Scientific Model Assumptions & Engineering Boundaries

This document details the mathematical formulations, physical parameters, valid operating ranges, and uncertainties across the five deterministic intelligence engines in **VayuSenseX**.

---

## 1. Atmospheric Stagnation & Inversion Diagnostics

### Mathematical Basis
- **Ventilation Index ($VI$ in $m^2/s$):**
  $$VI = PBLH \times U_{surface}$$
  Where $PBLH$ is the Planetary Boundary Layer Height in meters, and $U_{surface}$ is the 10-meter wind speed in meters per second ($1\ km/h = \frac{1}{3.6}\ m/s$).

### Classification Boundaries
- $VI < 1500\ m^2/s$: Critical Atmospheric Stagnation
- $1500 \le VI < 2500\ m^2/s$: Poor Ventilation
- $2500 \le VI < 6000\ m^2/s$: Moderate Dispersion
- $VI \ge 6000\ m^2/s$: Favorable Natural Dispersion

### Scientific Restrictions & Limitations
> [!IMPORTANT]
> Ground-level weather stations cannot measure vertical atmospheric temperature soundings (lapse rates). Therefore, conditions exhibiting $PBLH < 250\ m$, $U < 4\ km/h$, $RH \ge 75\%$, and $T \le 15^\circ C$ are classified as **inversion-compatible conditions**, never as an empirically verified thermal inversion.

---

## 2. Indoor Single-Zone Mass-Balance Model

### Differential Equation
$$\frac{dC_{in}}{dt} = P \lambda C_{out} + \frac{S}{V} - \left(\lambda + k + \frac{\eta Q}{V}\right) C_{in}$$

### Analytical Solution (Piecewise-Constant Interval)
$$C_{in}(t) = C_{ss} + (C_0 - C_{ss}) e^{-R t}$$
Where:
- Total Removal Rate ($R$ in $h^{-1}$): $R = \lambda + k + \frac{\eta Q}{V}$
- Steady-State Concentration ($C_{ss}$ in $\mu g/m^3$): $C_{ss} = \frac{P \lambda C_{out} + S/V}{R}$
- Time to 90% Clean-Up ($t_{90}$ in minutes): $t_{90} = \frac{\ln(10)}{R} \times 60$

### Parameter Validity & Assumptions
| Parameter | Description | Typical Value | Validity Range | Sourced From |
| :--- | :--- | :--- | :--- | :--- |
| $V$ | Room Volume | $30 - 100\ m^3$ | $> 0\ m^3$ | User dimensions |
| $P$ | Particle Penetration Factor | $0.65 - 0.80$ | $[0.0, 1.0]$ | EPA IAQ / LBNL |
| $\lambda$ | Air Exchange Rate | $0.2 - 2.0\ h^{-1}$ | $[0.05, 10.0]$ | ASHRAE 62.2 |
| $k$ | Particle Deposition Rate | $0.15 - 0.25\ h^{-1}$ | $[0.0, 1.0]$ | Thatcher et al. (PM2.5) |
| $\eta$ | Filter Single-Pass Efficiency | $0.9997$ (HEPA), $0.85$ (MERV-13) | $[0.0, 1.0]$ | AHAM AC-1 |
| $Q$ | Clean Air Delivery Rate (CADR) | $150 - 600\ m^3/h$ | $\ge 0\ m^3/h$ | Manufacturer / AHAM |
| $S$ | Indoor Generation Rate | $0 - 45,000\ \mu g/h$ | $\ge 0\ \mu g/h$ | EPA Indoor Sources |

### Key Caveat: Houseplant Filtration Myth
Ordinary household potted plants provide less than $0.05\ ACH$ equivalent clean air delivery. Peer-reviewed literature confirms they cannot meaningfully replace mechanical HEPA or MERV filtration during severe winter smog episodes.

---

## 3. Inhaled Particulate Dose ($D$)

### Formulation
$$D = \sum_{t=1}^{n} (C_t \times BR_t \times \Delta t)$$
Where:
- $D$: Estimated inhaled particulate mass ($\mu g$).
- $C_t$: Microenvironment breathing-zone PM2.5 concentration ($\mu g/m^3$).
- $BR_t$: Volumetric inhalation rate ($m^3/h$), sourced from US EPA Exposure Factors Handbook (Chapter 6).
- $\Delta t$: Duration in hours ($h$).

### Volumetric Breathing Rates ($m^3/h$)
| Activity Level | Adult | Child (6–11 yrs) | Elderly (65+) | Pregnant | Respiratory Sensitive |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Sleep | 0.45 | 0.32 | 0.40 | 0.50 | 0.48 |
| Sedentary / Desk | 0.54 | 0.40 | 0.50 | 0.62 | 0.58 |
| Light Activity | 1.20 | 0.95 | 1.10 | 1.35 | 1.25 |
| Moderate Exercise | 1.80 | 1.45 | 1.60 | 2.00 | 1.90 |
| Heavy Exercise | 3.00 | 2.20 | 2.50 | 3.20 | 3.10 |

### Boundary & Ethical Limitation
Inhaled particulate mass reflects gross intake, NOT systemic pulmonary deposition, alveolar absorption, or clinical prognosis. It is strictly an exposure comparison indicator.

---

## 4. Transportation Lifecycle Emissions

### Formula
$$E_{trip} = d \times EF_{lifecycle}$$
$$\Delta E_{trip} = \max\left(0, E_{current} - E_{alternative}\right)$$
$$\Delta E_{annual} = \Delta E_{trip} \times 2 \times d_{week} \times 52 / 1000\ (\text{kg } CO_2e)$$

### Emission Factors ($g\ CO_2e / \text{passenger}\cdot km$)
- Single Petrol Car: $172\ g\ CO_2e/km$ (India GHG Protocol)
- Single Diesel Car: $188\ g\ CO_2e/km$
- Electric Car (EV): $68\ g\ CO_2e/km$ (CEA Grid Baseline $0.716\ kg/kWh$)
- Two-Wheeler Motorcycle: $70\ g\ CO_2e/km$
- City Transit Bus: $48\ g\ CO_2e/p\cdot km$
- Rapid Electric Metro: $22\ g\ CO_2e/p\cdot km$ (DMRC Sustainability Report)
- Carpool (3 passengers): $58\ g\ CO_2e/p\cdot km$
- Cycling / Walking: $5\ g / 0\ g\ CO_2e/km$ (Lifecycle boundary noted)

---

## 5. What-If Household Scenario Simulation

Connects indoor mass-balance, commute shifts, outdoor exercise timing, and combustion elimination into an integrated evaluation comparing Baseline vs Alternative.
- Avoids double counting by keeping trip distances and room volumes identical between paired scenarios.
- Quantifies both **acute particulate dose avoided ($\mu g$)** and **chronic greenhouse gas reduction ($g\ CO_2e$)**.
