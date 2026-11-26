# VayuSenseX — Accessibility (WCAG 2.2 Level AA)

VayuSenseX is engineered to meet **WCAG 2.2 Level AA** standards across all workbenches, telemetry charts, and interactive controls.

- **Minimum Contrast Ratio:** `12.4:1` to `15.8:1` on primary dark-first Carbon surfaces (`#0b0e14` / `#1e2638`).
- **Keyboard & Focus Navigation:** Skip-to-main-content anchor (`#main-content`), zero keyboard traps, visible `:focus-visible` cyan rings (`2px solid var(--accent)`).
- **Screen Reader Twins & Live Alerts:** `.sr-only` structured data twins on 24-hour forecast timelines (`HourlyForecastView.tsx`) and `role="alert"` / `aria-live="polite"` atmospheric inversion banners (`DashboardPage.tsx`).
- **Reduced Motion:** Full `@media (prefers-reduced-motion: reduce)` support.

See full audits: [docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md) and [docs/ACCESSIBILITY_AUDIT.md](docs/ACCESSIBILITY_AUDIT.md).
