# VayuSenseX — Problem Statement Alignment & Requirements Traceability Matrix (RTM)

## Official Competition Problem Statement

> **Challenge 6: Urban Air Quality Assistant**  
> Create a GenAI-powered assistant that helps families and communities navigate severe winter smog and urban air pollution.  
> 
> The application should:
> 1. Suggest low-emission daily routines.
> 2. Provide indoor air-quality improvements.
> 3. Recommend sustainable alternatives.
> 4. Personalize recommendations according to location and lifestyle.
> 5. Clearly explain the direct impact of users' choices.

---

## Requirements Traceability Matrix (RTM)

| Official Problem Requirement | VayuSenseX Architectural Implementation | Supporting Code Files | Automated Verification Test Suites |
| :--- | :--- | :--- | :--- |
| **1. Suggest low-emission daily routines** | Evidence-grounded schedule optimizer that detects peak morning nocturnal inversion caps and reschedules outdoor exertion to afternoon cleanest dispersion windows. | `src/domain/planner/`<br>`src/features/planner/PlannerWorkbench.tsx` | `tests/domain/planner.test.ts`<br>`tests/domain/planner-extended.test.ts` |
| **2. Provide indoor air-quality improvements** | Single-zone mass-balance ODE engine calculating penetration, deposition, and CADR airflow requirements. Includes DIY Box Fan / Corsi-Rosenthal filter sizing. | `src/domain/indoor/`<br>`src/features/indoor/IndoorWorkbench.tsx` | `tests/domain/indoor.test.ts`<br>`tests/domain/indoor-physics.test.ts` |
| **3. Recommend sustainable alternatives** | Well-to-Wheel (WTW) transportation lifecycle emissions comparison and Dijkstra Clean Corridor router separating vehicle tailpipe emissions from commuter inhaled dose. | `src/domain/sustainability/`<br>`src/domain/mobility/`<br>`src/features/mobility/MobilityWorkbench.tsx` | `tests/domain/sustainability.test.ts`<br>`tests/domain/dijkstra-router.test.ts`<br>`tests/domain/mobility-corridors.test.ts` |
| **4. Personalize recommendations by location & lifestyle** | Sharma Family benchmark household archetype; captures age cohorts, pre-existing asthma, room dimensions, building sealing, and commute schedules. Live geocoding across Indian cities. | `src/domain/household/`<br>`src/services/environment/`<br>`src/features/household/HouseholdWorkbench.tsx` | `tests/domain/household.test.ts`<br>`tests/api/open-meteo.test.ts` |
| **5. Clearly explain direct impact of choices** | Unified Measurable Impact Ledger with anti-double-counting guard; computes realized vs projected particulate dose avoided ($\mu\text{g}$) and carbon abated ($\text{g CO}_2\text{e}$). Grounded GenAI explains with Fact IDs. | `src/domain/impact/`<br>`src/services/ai/`<br>`src/features/impact/ImpactWorkbench.tsx`<br>`src/features/assistant/AIAssistantWorkbench.tsx` | `tests/domain/impact-ledger.test.ts`<br>`tests/domain/impact-extended.test.ts`<br>`tests/api/ai-grounding.test.ts`<br>`tests/server/server-ai-service.test.ts` |
| **6. Community resilience & collective action** | Local-first, privacy-preserving Community Resilience Hub enabling neighborhood pledges (dust suppression, waste burning ban, carpools) with anonymous aggregate impact metrics. | `src/domain/community/`<br>`src/features/community/CommunityHub.tsx` | `tests/domain/community.test.ts` |
