# VayuSenseX Security Policy & Threat Model

## Threat Model & Principles
1. **Zero Secret Exposure**:
   - GenAI API keys (`GEMINI_API_KEY`) are loaded strictly server-side in Express 5 and transmitted to Google AI Studio exclusively via the `x-goog-api-key` HTTP header (never in URL query strings or client bundles).
2. **Perimeter & Header Hardening (`server.ts` & `server/middleware.ts`)**:
   - `app.disable('x-powered-by')` removes framework fingerprinting.
   - Strict `Content-Security-Policy` (`script-src 'self'`, `frame-ancestors 'none'`, `object-src 'none'`), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy`, and conditional HTTPS `Strict-Transport-Security`.
   - `express.json({ limit: '15kb' })`, IP rate limiting (`30 req/min` with reverse-proxy `trust proxy`), strict CORS origin allowlist, and CWE-209 sanitized error handler (400 on malformed JSON, zero stack traces leaked).
3. **Strict Zod Input Validation (`server/schemas.ts`)**:
   - All `/api/briefing` and `/api/assist` payloads use `.strict()` Zod schemas with bounded strings, finite geographic coordinates (`latitude`/`longitude`), finite nonnegative pollutant bounds, and zero `z.any()` escape hatches.
4. **Fact-ID Grounding & Anti-Hallucination Guard**:
   - Gemini responses are validated against an immutable `FactRegistry`; ungrounded or hallucinated numerical claims trigger automatic deterministic fallback.
5. **Privacy-Preserving Guest Mode**:
   - Family sensitivities, home dimensions, and schedules reside exclusively in browser `localStorage` with zero remote tracking.

## Reporting a Vulnerability
If you discover a security issue, please open an issue in this repository or contact the maintainer directly.
