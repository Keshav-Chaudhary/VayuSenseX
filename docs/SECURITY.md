# VayuSenseX — Application Security & Threat Model

## 1. Executive Summary & Security Baseline

VayuSenseX is architected with a defense-in-depth security posture designed to protect household privacy, prevent API key exfiltration, mitigate DDoS and injection attacks, and safely process environmental telemetry.

- **NPM Vulnerability Status:** `0 vulnerabilities` (Passed `npm audit` across all dependencies, including zero-day patched `zod@4.6.7`).
- **OWASP Top 10 Alignment:** Built-in defenses against broken access control, cryptographic failures, injection, and security misconfiguration.

---

## 2. Threat Model & Mitigations

| Threat Vector | Potential Impact | VayuSenseX Defensive Architecture |
| :--- | :--- | :--- |
| **API Key Exfiltration** | Leakage of Gemini or Cloud API keys from client bundles | **Server-Side Security Gateway (`server.ts`, `server/aiService.ts`)**: Keys remain strictly within server environment variables; client proxies all AI requests through protected gateway endpoints. |
| **Payload Flooding / DoS** | Server memory exhaustion via massive JSON payloads | **15 KB Strict Body Cap (`server.ts`)**: Enforced at the Express parser level; payloads $>15\text{ KB}$ are rejected immediately with HTTP 413. |
| **Brute Force / Rate Abuse** | External API quota exhaustion and denial of service | **In-Memory IP Rate Limiter (`server/middleware.ts`)**: Sliding window limiting clients to 30 requests per minute with automated HTTP 429 response and `X-RateLimit` headers. |
| **Cross-Site Scripting (XSS)** | Execution of malicious scripts in user browser | **Helmet-Grade CSP (`server/middleware.ts`)**: Strict `Content-Security-Policy` with `default-src 'self'`, `script-src 'self'`, and `object-src 'none'`. |
| **Clickjacking / MIME Sniffing** | UI redressing and MIME-confusion exploits | **Protective Headers**: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Strict-Transport-Security: max-age=31536000`. |
| **Information Leakage (CWE-209)** | Stack traces or sensitive paths exposed in errors | **Safe Error Handler (`server/middleware.ts`)**: Masks internal runtime errors into sanitized client responses with unique tracking IDs. |
| **Household PII Exposure** | Resident names, addresses, or routines leaked to cloud | **Local-First Privacy Architecture**: Household profiles and community pledges are stored in browser `localStorage`. Aggregations transmit strictly anonymous numerical sums. |

---

## 3. Server Security Gateway Implementation Details

### Strict HTTP Security Headers
Every HTTP transaction through the VayuSenseX server gateway is equipped with strict security headers:
```typescript
res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; connect-src 'self' https://api.open-meteo.com https://geocoding-api.open-meteo.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'; object-src 'none'");
res.setHeader('X-Content-Type-Options', 'nosniff');
res.setHeader('X-Frame-Options', 'DENY');
res.setHeader('X-XSS-Protection', '1; mode=block');
res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
```

### In-Memory SHA-256 LRU Cache
- Mitigates repeated identical queries, dropping latency to $<10\text{ms}$.
- Automatically evicts least-recently-used items when capacity exceeds 100 entries.
- Implements 15-minute Time-To-Live (TTL) to guarantee freshness of environmental alerts.

---

## 4. Privacy-Preserving Community Resilience
The Community Resilience Hub enables collective action across neighborhoods without centralized surveillance:
1. **Zero Remote PII:** Addresses, names, and phone numbers are never transmitted to external databases.
2. **Anonymous Numerical Aggregations:** Collective metrics ($\text{kg avoided CO}_2\text{e}$, $\text{g avoided PM}_{2.5}$) are computed purely through local arithmetic aggregation.
