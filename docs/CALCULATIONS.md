# VayuSenseX Scientific Calculations & Formulas

## 1. Sub-Index Linear Interpolation (CPCB & US EPA)
For any given pollutant concentration $C_p$, the sub-index $I_p$ is calculated as:
$$I_p = \frac{I_{Hi} - I_{Lo}}{B_{Hi} - B_{Lo}} \times (C_p - B_{Lo}) + I_{Lo}$$

Where:
- $C_p$: Measured or modelled pollutant concentration.
- $B_{Lo}, B_{Hi}$: Concentration breakpoints bracketing $C_p$.
- $I_{Lo}, I_{Hi}$: AQI sub-index values corresponding to $B_{Lo}$ and $B_{Hi}$.
- Composite AQI: $\max_{p}(I_p)$.

## 2. Inhaled Particulate Dose ($D$)
Quantifies the mass of particulate matter inhaled over scheduled activities:
$$D = \sum_{t=1}^{n} C_t \times BR_t \times \Delta t$$

Where:
- $C_t$: Breathing zone concentration ($\mu g / m^3$).
- $BR_t$: Volumetric breathing rate ($m^3 / h$), based on US EPA Exposure Factors:
  - Sleep / Rest: $0.45\ m^3/h$
  - Sedentary / Office: $0.60\ m^3/h$
  - Moderate Walking: $1.20\ m^3/h$
  - Vigorous Exercise: $2.10\ m^3/h$
- $\Delta t$: Duration of exposure ($h$).

## 3. Indoor Single-Zone Mass-Balance Differential Equation
$$\frac{dC_{in}}{dt} = P \lambda C_{out} + \frac{S}{V} - \left( \lambda + k + \frac{\eta Q}{V} \right) C_{in}$$

Where:
- $C_{in}$: Indoor concentration ($\mu g / m^3$)
- $C_{out}$: Outdoor concentration ($\mu g / m^3$)
- $P$: Penetration factor ($0.6 - 0.9$ depending on envelope tightness)
- $\lambda$: Natural air exchange rate ($ACH$, $h^{-1}$)
- $S$: Indoor generation rate ($\mu g / h$, e.g. incense, cooking)
- $V$: Room volume ($m^3$)
- $k$: Natural deposition loss rate ($h^{-1}$)
- $\eta$: Filter efficiency (HEPA $\approx 0.9997$, DIY Box-fan MERV-13 $\approx 0.85$)
- $Q$: Clean Air Delivery Rate ($CADR$, $m^3/h$)

## 4. Required Clean Air Delivery Rate (CADR)
$$CADR_{required} = V \times ACH_{target}$$
For severe smog conditions, recommended $ACH_{target} = 5.0$.
