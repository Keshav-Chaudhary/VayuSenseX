# VayuSenseX — Automated Testing & Verification

VayuSenseX runs a multi-layered Vitest verification suite (**963 automated tests across 43 test files, 100% passing; 88.81% line coverage overall / 97.87% in `server/`**) across domain math, end-to-end Express HTTP security routes, Gemini grounding/retry logic, Nominatim geocoding, SSR landmarks, and interactive JSDOM user events:

- **Run all tests:** `npm test`
- **Run coverage:** `npm run test:coverage`
- **Run static lint:** `npm run lint`
- **Run strict typecheck:** `npm run typecheck`

See full suite matrix and coverage report: [docs/TESTING.md](docs/TESTING.md).
