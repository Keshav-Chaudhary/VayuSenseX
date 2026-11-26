# VayuSenseX — Code Quality & Architecture Standards

- **Strict TypeScript:** `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`, `noUncheckedIndexedAccess: true` (`0` compiler errors).
- **Static Analysis:** `oxlint` configured via `.oxlintrc.json` (`npm run lint`) with **0 errors and 0 warnings** across 110 files, plus zero `any` type assertions.
- **Modular File Ceiling:** Every `.ts` / `.tsx` source file in `src/`, `server/`, and `server.ts` is strictly maintained at **≤ 250 lines** (see [docs/CODE_QUALITY_REPORT.md](docs/CODE_QUALITY_REPORT.md)).
- **Decoupled Architecture:** Pure deterministic scientific engines (`src/domain/*`), React 19 UI (`src/features/*`, `src/components/*`), and Express 5 security gateway (`server.ts`, `server/*`).
- **Editor & Hygiene:** `.editorconfig`, repository size guard (`< 10 MB`), and GitHub Actions CI pipeline (`.github/workflows/ci.yml`).

See full details: [docs/CODE_QUALITY.md](docs/CODE_QUALITY.md) and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
