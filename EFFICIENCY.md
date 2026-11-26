# VayuSenseX — Efficiency & Performance Engineering

- **Code-Splitting & Lazy Loading:** Secondary workbenches are lazy-loaded via `React.lazy()` + `Suspense`, with vendor chunking (`react-vendor`, `icons-vendor`) in `vite.config.ts`.
- **Sub-Millisecond AI Cache:** In-memory 64-character SHA-256 LRU cache (`server/cache.ts`, max 100 entries, 15-min TTL) cuts repeated AI latency from ~1,200 ms to `< 1 ms`.
- **Compact Repository Footprint:** Tracked source size under `1 MB` vs the `10.0 MB` competition ceiling (`npm run check-size`).
- **Firebase Hosting Asset Caching:** Immutable `max-age=31536000` caching on `/assets/**` configured in `firebase.json`.

See full details: [docs/EFFICIENCY.md](docs/EFFICIENCY.md).
