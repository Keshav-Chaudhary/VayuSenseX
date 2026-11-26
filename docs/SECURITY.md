# VayuSenseX — Application Security & Threat Model

## 1. Executive Summary & Security Baseline

VayuSenseX is architected with a defense-in-depth security posture designed to protect household privacy, prevent API key exfiltration, mitigate DDoS and injection attacks, and safely process environmental telemetry.

- **NPM Vulnerability Status:** `0 vulnerabilities` (Passed `npm audit` across 236 dependencies).
- **OWASP Top 10 Alignment:** Built-in defenses against broken access control, cryptographic failures, injection, and security misconfiguration.
- **Server-Side Security Gateway:** Zero client-side API key exposure; all LLM operations and upstream telemetry proxy through protected backend endpoints.

---

## 2. Threat Model & Mitigations

| Threat Vector | Potential Impact | VayuSenseX Defensive Architecture |
| :--- | :--- | :--- |
| **API Key Exfiltration** | Leakage of Gemini or Cloud API keys from client JavaScript bundles | **Strict Server-Only Custody (`server.ts`, `server/aiService.ts`)**: All Gemini API keys are held strictly in server environment variables (`process.env.GEMINI_API_KEY`). The client contains zero probes or references to `VITE_GEMINI_API_KEY`. |
| **Payload Flooding / DoS** | Server memory exhaustion via massive JSON payloads | **15 KB Strict Body Cap (`server.ts`)**: Enforced at the Express parser level; payloads $>15\text{ KB}$ are rejected immediately with HTTP 413. |
| **Malformed / Poisoned Input** | Unhandled server crashes, type pollution, or prompt injection | **Zod 3.x/4.x Runtime Schema Validation (`server/schemas.ts`)**: Strict schema validation on all incoming `/api/briefing` and `/api/assist` bodies with safe HTTP 400 error returns. |
| **Brute Force / Rate Abuse** | External API quota exhaustion and denial of service | **Reverse-Proxy Aware Rate Limiting (`server/middleware.ts`)**: Sliding window limiting clients to 30 requests per minute with automated HTTP 429 response. Safely extracts client IPs via `req.ip` and `X-Forwarded-For` with `trust proxy` enabled. |
| **Cache Poisoning / Collisions** | Stale or cross-tenant data served from cache | **Collision-Resistant Full SHA-256 LRU Cache (`server/cache.ts`)**: Generates 64-character hex digests across sorted parameter keys, with defensive guards rejecting null/undefined entries. |
| **Cross-Site Scripting (XSS)** | Execution of malicious scripts in user browser | **Helmet-Grade CSP (`server/middleware.ts`)**: Strict `Content-Security-Policy` with `default-src 'self'`, `script-src 'self'`, and `object-src 'none'`. |
| **Clickjacking / MIME Sniffing** | UI redressing and MIME-confusion exploits | **Protective Headers**: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`. |
| **Insecure Transport** | Man-in-the-middle downgrade attacks | **Conditional Production HSTS**: `Strict-Transport-Security: max-age=31536000` enforced conditionally when `NODE_ENV === 'production'` and HTTPS is verified, preserving local dev usability. |
| **Information Leakage (CWE-209)** | Stack traces or sensitive paths exposed in errors | **Safe Error Handler (`server/middleware.ts`)**: Masks internal runtime errors into sanitized client responses with unique tracking IDs. |
| **Household PII Exposure** | Resident names, addresses, or routines leaked to cloud | **Local-First Privacy Architecture**: Household profiles, custom schedules, and community pledges are stored in browser `localStorage`. Aggregations transmit strictly anonymous numerical sums. |

---

## 3. Server Security Gateway Implementation Details

### Strict HTTP Security Headers
Every HTTP transaction through the VayuSenseX server gateway is equipped with strict security headers:
```typescript
res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; connect-src 'self' https://api.open-meteo.com https://geocoding-api.open-meteo.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'; object-src 'none'");
res.setHeader('X-Content-Type-Options', 'nosniff');
res.setHeader('X-Frame-Options', 'DENY');
res.setHeader('X-XSS-Protection', '1; mode=block');

// Strict HSTS only in production over HTTPS to prevent local development breakage
if (process.env.NODE_ENV === 'production' && (req.secure || req.headers['x-forwarded-proto'] === 'https')) {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
}
```

### Request Body Zod Schemas
Incoming POST bodies are strictly validated against strongly typed Zod schemas prior to dispatch:
```typescript
export const BriefingRequestSchema = z.object({
  profile: HouseholdProfileSchema.optional(),
  snapshot: EnvironmentalSnapshotSchema.optional(),
  hourlyForecast: z.array(HourlyForecastPointSchema).max(72).optional(),
});

export const AssistRequestSchema = z.object({
  userPrompt: z.string().min(1).max(500),
  profile: HouseholdProfileSchema.optional(),
  snapshot: EnvironmentalSnapshotSchema.optional(),
  hourlyForecast: z.array(HourlyForecastPointSchema).max(72).optional(),
});
```

### In-Memory 64-Character SHA-256 LRU Cache
- Mitigates repeated identical queries, dropping latency to $<1\text{ms}$.
- Full 64-character SHA-256 hex digest eliminates hash collision vulnerabilities (birthday attack).
- Automatically evicts least-recently-used items when capacity exceeds 100 entries.
- Implements 15-minute Time-To-Live (TTL) to guarantee freshness of environmental alerts.
- Defensive guards reject caching null, undefined, or empty payloads.

---

## 4. Privacy-Preserving Community Resilience
The Community Resilience Hub enables collective action across neighborhoods without centralized surveillance:
1. **Zero Remote PII:** Addresses, names, and phone numbers are never transmitted to external databases.
2. **Modeled Archetype Disclosure:** Transparently labeled as a modeled neighborhood archetype representing local-first aggregated environmental actions.
3. **Anonymous Numerical Aggregations:** Collective metrics ($\text{kg avoided CO}_2\text{e}$, $\text{g avoided PM}_{2.5}$) are computed purely through local arithmetic aggregation.
