# VayuSenseX — Data Provenance & Provider Report (`DATA_PROVENANCE_REPORT.md`)

**Date:** 2026-11-26  
**Centralized Service:** `src/services/environment/` (`open-meteo.ts`, `geocoding.ts`, `cache.ts`, `types.ts`)

---

## 1. Live Data Providers

| Provider | Endpoint | Data Provided | Units & Normalization | Refresh / Cache TTL | Limitations |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Open-Meteo Air Quality (Copernicus CAMS)** | `air-quality-api.open-meteo.com/v1/air-quality` | Current & hourly $\text{PM}_{2.5}, \text{PM}_{10}, \text{NO}_2, \text{O}_3, \text{SO}_2, \text{CO}$ | $\mu\text{g/m}^3$ (`CO` converted from $\mu\text{g/m}^3 \to \text{mg/m}^3$ for CPCB) | 15-minute TTL (`EnvironmentalCache`) | Regional CAMS grid estimates, not individual street-corner IoT monitors |
| **Open-Meteo Weather** | `api.open-meteo.com/v1/forecast` | Temperature, relative humidity, 10m wind speed/direction, surface pressure, planetary boundary layer height | °C, %, km/h, hPa, m | 15-minute TTL (`EnvironmentalCache`) | Modelled meteorological boundary-layer height |
| **Open-Meteo Geocoding** | `geocoding-api.open-meteo.com/v1/search` | City/region search to `(latitude, longitude)` | Decimal degrees | On-demand per user search | Requires network connectivity |

---

## 2. Provenance, Freshness & Offline Behavior

- **Statuses Tracked:** `LIVE`, `CACHED`, `STALE`, `ILLUSTRATIVE` (`src/services/environment/types.ts`).
- **Explicit Offline Disclosure:** When Open-Meteo is unreachable, `App.tsx` sets `telemetryError` and `DashboardPage.tsx` renders an explicit `role="alert"` provider notice banner with a **Retry Live Sync** button instead of silently presenting fallback data as live.
- **Modeled Workbenches Disclosure:**
  - `MobilityWorkbench.tsx` explicitly labels its 6-node urban network as a **Modeled Corridor Archetype** (not live street traffic telemetry) while synchronizing ambient $\text{PM}_{2.5}$ with the active selected city.
  - `CommunityHub.tsx` explicitly labels neighborhood pledges as **Local-First Privacy — Zero Remote PII** and scopes collective summaries to the active selected city.
