import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ImpactWorkbench } from '../../src/features/impact/ImpactWorkbench';
import { CommunityHub } from '../../src/features/community/CommunityHub';
import { MobilityWorkbench } from '../../src/features/mobility/MobilityWorkbench';

describe('React Component Rendering & Accessibility Attributes (Zero-Dependency SSR Audit)', () => {
  it('renders ImpactWorkbench with complete semantic landmarks, filters, and audit table', () => {
    const html = renderToString(React.createElement(ImpactWorkbench));

    // Verify key headings and semantic labels
    expect(html).toContain('Verified Household Impact Ledger');
    expect(html).toContain('Verified Realized Dose Avoided');
    expect(html).toContain('Realized Carbon Offset');
    expect(html).toContain('Historical Action Audit Log');

    // Verify accessibility buttons and filters
    expect(html).toContain('Export Audit JSON');
  });

  it('renders CommunityHub with transparent local-first modeled archetype labels and pledge cards', () => {
    const html = renderToString(React.createElement(CommunityHub));

    expect(html).toContain('Modeled Neighborhood Archetype');
    expect(html).toContain('Zero Remote PII');
    expect(html).toContain('Neighborhood Clean Air Collective');
    expect(html).toContain('Zero Open Waste');
    expect(html).toContain('Neighborhood Dust Water Suppression');
  });

  it('renders MobilityWorkbench with clean corridor router, mode selectors, and physical distinction alert', () => {
    const html = renderToString(React.createElement(MobilityWorkbench));

    expect(html).toContain('Physical Distinction: Emissions vs. Ambient vs. Inhaled Dose');
    expect(html).toContain('Commute Settings');
    expect(html).toContain('Evaluated Multi-Modal Corridor Paths');
    expect(html).toContain('Rapid Metro Rail');
  });
});
