# VayuSenseX — Algorithmic Efficiency & Performance Engineering

## 1. Algorithmic Complexity Profile

| Component | Operation | Theoretical Big-O Complexity | Real-World Benchmark |
| :--- | :--- | :---: | :---: |
| **AQI Calculator** | CPCB / US EPA linear breakpoint search | $O(1)$ | $<0.05\text{ ms}$ |
| **Indoor Mass Balance** | Analytical single-zone ODE decay | $O(1)$ | $<0.08\text{ ms}$ |
| **Inhaled Dose Engine** | Multi-interval Riemann sum | $O(N)$ where $N \le 24$ | $<0.15\text{ ms}$ |
| **Dijkstra Router** | Shortest-exposure graph pathfinding | $O(V + E \log V)$ | $<0.60\text{ ms}$ |
| **Impact Ledger** | Deduplication check and update | $O(M)$ where $M \le 1000$ | $<0.40\text{ ms}$ |
| **SHA-256 LRU Cache** | Key lookup & eviction | $O(1)$ hash map lookup | $<0.02\text{ ms}$ |

---

## 2. In-Memory SHA-256 LRU Cache Benchmarks

The VayuSenseX server gateway integrates a bounded SHA-256 in-memory LRU cache (`server/cache.ts`):
- **Cache Hit Latency:** $<1.0\text{ ms}$ (measured sub-millisecond retrieval in automated tests).
- **External API Conservation:** Eliminates duplicate LLM and weather requests within a 15-minute window.
- **Memory Footprint:** Fixed upper bound of 100 entries prevents heap expansion.

---

## 3. Host Memory & Virtual Pagefile Optimization

To guarantee reliable execution across diverse host environments (including resource-constrained CI agents and low-memory developer laptops):
- **Heap Allocation Cap:** Configured `node --max-old-space-size=280` in npm build and typecheck scripts.
- **Vitest Concurrency Control:** Vitest configured with `--no-file-parallelism` to prevent V8 memory exhaustion and pagefile thrashing during high-volume test runs.
- **Redirected Package Cache:** npm cache configured to dedicated drive volume (`D:\Temp\npm-cache`), ensuring 0 disk starvation on primary OS drives.

---

## 4. Bundle Size & Tracked Repository Size Audit

### Production Bundle Size (Vite 6)
- **HTML Document:** `1.12 kB` (gzipped: `0.61 kB`)
- **Compiled CSS:** `34.58 kB` (gzipped: `6.73 kB`)
- **Compiled Application Bundle:** `565.98 kB` (gzipped: `154.05 kB`)
- **Total Production Network Footprint:** **`~161 kB gzipped`**

### Repository Tracked Source Size
- **Competition Rule:** Repository size must be strictly $< 10.00\text{ MB}$.
- **VayuSenseX Measured Tracked Size:** **`0.638 MB`** (Enforced by `scripts/check-repo-size.mjs`).
- **Safety Margin:** **`9.36 MB remaining (93.6% under limit)`**.
