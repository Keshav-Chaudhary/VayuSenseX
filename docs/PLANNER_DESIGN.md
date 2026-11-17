# VayuSenseX — Daily Routine Planner Design

## 1. Environmental Problem & Motivation

In winter smog conditions across northern India, diurnal temperature inversions compress the atmospheric planetary boundary layer (PBL) to under 200 meters between midnight and 08:30 AM. Particulates from traffic, road dust, and biomass combustion remain trapped at breathing height.

Conversely, between 12:00 PM and 3:30 PM, solar radiation heats the surface, expanding the boundary layer up to 1,200 meters. This dilutes ground-level PM2.5 concentrations by 40% to 60%.

The goal of the **VayuSenseX Daily Planner** is to reschedule flexible household activities (workouts, market visits, non-critical commutes) away from high-inversion peaks into solar dispersion windows or filtered indoor environments.

---

## 2. Optimization Algorithm & Constraints

The Schedule Optimizer (`src/domain/planner/schedule-optimizer.ts`) evaluates each activity in the household's routine against the 24-hour forecasted air quality:

### Constraint Taxonomy

1. **`FIXED` Activities:**
   - Activities such as school hours, fixed office shifts, and overnight sleep cannot be rescheduled.
   - *Mitigation strategy:* Prescribes protective interventions (e.g. N95 respirator during school commute, continuous HEPA purification during overnight sleep).

2. **`CAN_SUBSTITUTE_INDOORS` Activities:**
   - Outdoor workouts or play can be converted to indoor activities in a HEPA-purified zone.
   - *Mitigation strategy:* Replaces ambient outdoor PM2.5 exposure with the single-zone ODE indoor concentration ($C_{in}$), reducing inhaled dose by 70% to 85%.

3. **`FLEXIBLE_TIME` Activities:**
   - Errands, grocery shopping, or flexible exercise can shift hours.
   - *Mitigation strategy:* Identifies the lowest-exposure hour within a designated shift window (typically midday: 13:00 to 15:00), avoiding morning and late evening peaks.

---

## 3. Dose Reduction Quantifications

Inhaled particulate dose is calculated using the US EPA Exposure Factors Handbook formulas:

$$D = C \times \mathrm{BR} \times t$$

Where:
- $D$: Inhaled particulate mass ($\mu\text{g}$).
- $C$: Ambient or indoor particulate concentration ($\mu\text{g/m}^3$).
- $\mathrm{BR}$: Age- and exertion-adjusted volumetric breathing rate ($\text{m}^3/\text{min}$).
- $t$: Duration ($\text{minutes}$).

By computing $D_{\text{before}}$ across the baseline routine and $D_{\text{after}}$ across the rescheduled routine, VayuSenseX presents verified reductions (both in $\mu\text{g}$ avoided and percent reduction).

---

## 4. Benchmark Household Archetype: The Sharma Family

To provide immediate, zero-setup evaluator exploration, VayuSenseX includes the **Sharma Family Household Archetype** (`DEFAULT_HOUSEHOLD_PROFILE`):
- **Location:** Anand Vihar Sector 4, Delhi NCR.
- **Roster:**
  - *Rajesh (Adult, Standard):* Daily office commuter.
  - *Ananya (Daughter, 8 yrs, Child, High Sensitivity):* Primary school student; prone to asthma triggers.
  - *Om Prakash (Grandfather, 68 yrs, Older Adult, High Sensitivity):* Morning garden walker.
- **Home:** Apartment ($48\,\text{m}^3$ primary volume), $260\,\text{m}^3/\text{h}$ HEPA purifier, LPG kitchen, morning agarbatti burning.
- **Routine:** 6 routine activities covering overnight sleep, morning park walk, school bus commute, car commute, and neighborhood errands.
