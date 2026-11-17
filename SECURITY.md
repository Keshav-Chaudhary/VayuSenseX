# VayuSenseX Security Policy & Threat Model

## Threat Model & Principles
1. **Zero Secret Exposure**:
   - GenAI API keys (e.g. Google Gemini) are stored strictly on backend serverless environments or isolated behind server proxies.
   - Frontend client bundles never contain or log secret tokens.
2. **Fact-ID Grounding & Anti-Hallucination Guard**:
   - All quantitative numbers displayed must reference an authorized `FactId` produced by the deterministic engine.
   - Prevents prompt injection from overriding environmental measurements or safety precautions.
3. **Privacy-Preserving Guest Mode**:
   - Family sensitivities, home dimensions, and schedules are stored locally in the user's browser (`localStorage`) by default.
   - No sensitive personal details are sent to third-party analytics or server logging.
4. **Input Sanitization & Schema Validation**:
   - All incoming API parameters are strictly parsed using Zod schemas.
5. **Dependency Hygiene**:
   - Zero critical or high severity vulnerabilities maintained via automated package auditing.

## Reporting a Vulnerability
If you discover a security issue, please open an issue in this repository or contact the maintainer directly.
