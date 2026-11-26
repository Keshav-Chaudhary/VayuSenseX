# VayuSenseX — Code Quality & Architecture Standards

- **Strict TypeScript:** `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`, `noUncheckedIndexedAccess: true` (`0` compiler errors).
- **Static Analysis:** `oxlint` configured via `.oxlintrc.json` (`npm run lint`) with zero errors.
- **Decoupled Architecture:** Pure deterministic scientific engines (`src/domain/*`), React 19 UI (`src/features/*`, `src/components/*`), and Express 5 security gateway (`server.ts`, `server/*`).
- **Editor & Hygiene:** `.editorconfig`, repository size guard (`< 10 MB`), and GitHub Actions CI pipeline (`.github/workflows/ci.yml`).

See full details: [docs/CODE_QUALITY.md](docs/CODE_QUALITY.md) and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
