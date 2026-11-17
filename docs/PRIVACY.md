# VayuSenseX — Local-First Privacy & Sensitive Data Architecture

## 1. Zero-Telemetry Local-First Principle

VayuSenseX is designed as a **privacy-preserving local-first environmental intelligence system**. 

Air quality applications frequently handle sensitive data:
- Household addresses and GPS coordinates.
- Family member ages, pediatric vulnerabilities, and senior citizen status.
- Respiratory medical conditions (e.g., asthma, COPD, cardiovascular disease).
- Daily routine schedules (when family members leave home, commute routes, school timings).

In VayuSenseX, **no personal health, location, or routine data is ever stored on a remote backend database**.

---

## 2. Storage Architecture

1. **Client-Side Persistence:**
   All household profile data, family rosters, home attributes, and routine schedules are stored in the user's browser via the standard `localStorage` API (`HouseholdStore`).
2. **Zero Mandatory Sign-Up / Zero Auth:**
   The entire application runs in full guest mode without requiring user accounts, passwords, or emails.
3. **Data Portability:**
   Users can export their complete household twin at any time using the **Export JSON** feature, or import configurations across devices.
4. **Instant Erasure:**
   Clicking **Reset Benchmark** or clearing browser data immediately deletes all stored records.

---

## 3. Generative AI Information Boundary

When connecting to the Google Gemini API:
- **Never Transmitted:** Family names, detailed medical histories, exact street addresses, or personal schedules are stripped.
- **Transmitted Boundary:** Only anonymous aggregate numbers (e.g. ambient PM2.5 = $180\,\mu\text{g/m}^3$, cleanest hour = $14:00$, total baseline dose = $84.2\,\mu\text{g}$) are included in the `FactRegistry` payload sent to the LLM.
- **Optional API Key Security:** User-provided Gemini API keys are held strictly in browser local storage and used only to communicate directly with Google's endpoint (`generativelanguage.googleapis.com`) via HTTPS.
