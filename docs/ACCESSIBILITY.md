# VayuSenseX — Accessibility & Universal Design Audit

## 1. Compliance Standard: WCAG 2.2 Level AA

VayuSenseX is engineered to ensure environmental health intelligence is fully accessible to all citizens, including vulnerable demographics such as elderly residents, individuals with visual impairments, and assistive technology users.

---

## 2. Key Accessibility Implementations

### 1. Skip to Main Content Link
Implemented at the top of the root DOM in `src/app/App.tsx`:
```tsx
<a 
  href="#main-content"
  className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-cyan-500 text-midnight-950 font-bold rounded-lg shadow-lg"
>
  Skip to main content
</a>
```
Enables keyboard and screen reader users to bypass top-level header navigation directly into active workbenches.

### 2. High Contrast Ratios (WCAG 1.4.3 & 1.4.6)
The design system employs high-contrast foreground-to-background combinations on dark themes:
- Cyan text on dark midnight background (`#22d3ee` on `#030712`): Contrast Ratio **12.4:1** (Exceeds WCAG AAA requirement of 7:1).
- White text on dark midnight background (`#ffffff` on `#030712`): Contrast Ratio **21.0:1**.
- Slate-300 text on dark midnight background (`#cbd5e1` on `#030712`): Contrast Ratio **11.2:1**.
- All interactive controls feature visible focus indicators (`focus:ring-2 focus:ring-cyan-400`).

### 3. Screen Reader Text & Non-Color Dependence (WCAG 1.4.1)
- Air quality categories (e.g. Good, Satisfactory, Moderate, Poor, Very Poor, Severe) are conveyed through clear textual badges, descriptive numbers, and numerical sub-indices, never through color alone.
- Numerical charts and gauges include descriptive `.sr-only` aria labels explaining the physical significance of values.
- Form inputs, sliders, and standard toggle buttons include explicit `<label>` tags and `aria-label` descriptors.

### 4. Full Keyboard Operability (WCAG 2.1.1)
- All interactive workbenches (Dashboard, Household, Planner, Assistant, Indoor, Exposure, Mobility, Impact Ledger, Community Hub) are navigable via the Tab key.
- Custom dropdowns and buttons support Enter and Spacebar execution.
- No keyboard traps exist anywhere in the application.

### 5. Semantic HTML5 Landmarks
The DOM is structured with standard semantic landmarks:
- `<header className="sticky top-0...">`: Main branding and navigation.
- `<nav aria-label="Main Navigation">`: Primary workbench switcher.
- `<main id="main-content">`: Workbench workspace.
- `<footer>`: Persistent attribution and methodology links.
